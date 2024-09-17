#define CPPHTTPLIB_OPENSSL_SUPPORT
#include <iostream>
#include "./sqlite/sqlite3.h"
#include "httplib.h"

const int PORT = 443; // HTTPS port

int createLoginTable(sqlite3 *db)
{
	// Create table

	char *zErrMsg = 0;

	/* Create SQL statement */
	const char *sql = "CREATE TABLE LOGIN("
										"USERNAME   TEXT  PRIMARY KEY  NOT NULL,"
										"PASSWORD   TEXT               NOT NULL);";

	/* Execute SQL statement */
	int rc = sqlite3_exec(db, sql, 0, 0, &zErrMsg);
	if (rc != SQLITE_OK)
	{
		std::cerr << "SQL error: " << zErrMsg << std::endl;
		sqlite3_free(zErrMsg);
		return 1;
	}
	else
	{
		std::cout << "Table created successfully" << std::endl;
	}
	return 0;
}

enum RegisterErrors
{
	REGISTER_NO_ERROR,
	REGISTER_USERNAME_EXISTS,
	REGISTER_OTHER
};

int registerUser(sqlite3 *db, std::string username, std::string password)
{
	sqlite3_stmt *stmt;
	const char *sql = "INSERT INTO LOGIN (USERNAME, PASSWORD) VALUES (?, ?);";

	// Prepare the SQL statement
	int rc = sqlite3_prepare_v2(db, sql, -1, &stmt, 0);
	if (rc != SQLITE_OK)
	{
		std::cerr << "Cannot prepare statement: " << sqlite3_errmsg(db) << std::endl;
		return REGISTER_OTHER;
	}

	// Bind the username and password to the statement
	sqlite3_bind_text(stmt, 1, username.c_str(), -1, SQLITE_STATIC);
	sqlite3_bind_text(stmt, 2, password.c_str(), -1, SQLITE_STATIC);

	// Execute the statement
	rc = sqlite3_step(stmt);
	if (rc != SQLITE_DONE)
	{
		if (rc == SQLITE_CONSTRAINT)
		{
			std::cerr << "SQL error: " << sqlite3_errmsg(db) << std::endl;
			sqlite3_finalize(stmt);
			return REGISTER_USERNAME_EXISTS;
		}
		else
		{
			std::cerr << "SQL error: " << sqlite3_errmsg(db) << std::endl;
			sqlite3_finalize(stmt);
			return REGISTER_OTHER;
		}
	}

	// Finalize the statement
	sqlite3_finalize(stmt);
	return REGISTER_NO_ERROR;
}

enum LoginErrors
{
	LOGIN_NO_ERROR,
	LOGIN_USER_NOT_FOUND,
	LOGIN_WRONG_PASSWORD,
	LOGIN_OTHER
};

int loginUser(sqlite3 *db, std::string username, std::string password)
{
	sqlite3_stmt *stmt;
	const char *pzTest;

	/* Create SQL statement */
	const char *sql = "SELECT PASSWORD FROM LOGIN WHERE USERNAME = ?;";

	/* Prepare SQL statement */
	int rc = sqlite3_prepare_v2(db, sql, -1, &stmt, &pzTest);
	if (rc != SQLITE_OK)
	{
		std::cerr << "SQL error: " << sqlite3_errmsg(db) << std::endl;
		return LOGIN_OTHER;
	}

	/* Bind the username to the statement */
	sqlite3_bind_text(stmt, 1, username.c_str(), -1, SQLITE_STATIC);

	/* Execute SQL statement */
	rc = sqlite3_step(stmt);
	if (rc != SQLITE_ROW)
	{
		std::cerr << "User not found" << std::endl;
		sqlite3_finalize(stmt);
		return LOGIN_USER_NOT_FOUND;
	}

	const unsigned char *dbPasswordText = sqlite3_column_text(stmt, 0);
	if (dbPasswordText == nullptr)
	{
		std::cerr << "Password is NULL" << std::endl;
		sqlite3_finalize(stmt);
		return LOGIN_OTHER;
	}

	std::string dbPassword(reinterpret_cast<const char *>(dbPasswordText));
	if (dbPassword != password)
	{
		std::cerr << "Wrong password" << std::endl;
		sqlite3_finalize(stmt);
		return LOGIN_WRONG_PASSWORD;
	}

	sqlite3_finalize(stmt);
	return LOGIN_NO_ERROR;
}

typedef struct
{
	int session_id;
	std::string username;
} User_Session;

typedef struct
{
	User_Session user_session;
	std::string message;
	unsigned int timestamp;
} Message;

void add_cors_headers(httplib::Response &res)
{
	res.set_header("Access-Control-Allow-Origin", "*");										// Allow requests from any origin
	res.set_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS"); // Allowed methods
	res.set_header("Access-Control-Allow-Headers", "Content-Type");				// Allowed headers
}

void supListEndComma(std::string &toSup)
{
	// Find open arr [

	for (int i = toSup.length(); i >= 0; i--)
	{
		if (toSup[i] == ']' && toSup[i - 1] == ',')
		{
			for (int j = i - 1; j < toSup.length() - 1; j++)
			{
				toSup[j] = toSup[j + 1];
			}
			toSup.resize(toSup.length() - 1);
			return;
		}
	}
}

int main()
{
	sqlite3 *db;
	int rc = sqlite3_open("test.db", &db);
	std::list<User_Session> session_ids;
	std::list<Message> messages;
	srand(time(NULL));
	int general_id = rand();

	std::cout << "General ID: " << general_id << std::endl;

	if (rc)
	{
		std::cerr << "Can't open database: " << sqlite3_errmsg(db) << std::endl;
		return 1;
	}
	else
	{
		std::cout << "Opened database successfully" << std::endl;
	}

	createLoginTable(db);

	httplib::SSLServer svr("/etc/letsencrypt/live/www.chatpsp.run.place/fullchain.pem", "/etc/letsencrypt/live/www.chatpsp.run.place/privkey.pem");

	svr.Get("/register", [&](const httplib::Request &req, httplib::Response &res)
					{
    std::string username = req.get_param_value("username");
    std::string password = req.get_param_value("password");

    int registerResult = registerUser(db, username, password);
    if (registerResult == REGISTER_NO_ERROR)
    {
        res.set_content("{\"result\" : \"User registered\"}", "application/json");
    }
    else if (registerResult == REGISTER_USERNAME_EXISTS)
    {
        res.set_content("{\"result\" : \"Username already exists\"}", "application/json");
    }
    else
    {
        res.set_content("{\"result\" : \"Error registering user\"}", "application/json");
    }

    add_cors_headers(res); });

	svr.Get("/login", [&](const httplib::Request &req, httplib::Response &res)
					{
						std::string username = req.get_param_value("username");
						std::string password = req.get_param_value("password");

						std::cout << "Login request for user: " << username << std::endl;
						std::cout << "Password: " << password << std::endl;

						for (auto user_session : session_ids)
						{
							if (user_session.username == username)
							{
								res.set_content("{\"result\" : \"already_logged_in\", \"session_id\" : " + std::to_string(user_session.session_id) + ", \"general_id\" : " + std::to_string(general_id) + "}", "text/plain");
								add_cors_headers(res);
								return;
							}
						}

						int loginResult = loginUser(db, username, password);
						if (loginResult == LOGIN_NO_ERROR)
						{
							int session_id = rand();
							session_ids.push_back({session_id, username});
							res.set_content("{\"result\" : \"success\", \"session_id\" :" + std::to_string(session_id) + ", \"general_id\": " + std::to_string(general_id) + "}", "text/plain");
						}
						else if (loginResult == LOGIN_USER_NOT_FOUND)
						{
							res.set_content("{\"result\" : \"u_not_found\"}", "text/plain");
						}
						else if (loginResult == LOGIN_WRONG_PASSWORD)
						{
							res.set_content("{\"result\" : \"wrong_password\"}", "text/plain");
						}
						else
						{
							res.set_content("{\"result\" : \"login_error\"}", "text/plain");
						}

						add_cors_headers(res); });

	svr.Get("/logout", [&](const httplib::Request &req, httplib::Response &res)
					{
						int session_id = std::stoi(req.get_param_value("session_id"));
						for (auto it = session_ids.begin(); it != session_ids.end(); it++)
						{
							if (it->session_id == session_id)
							{
								session_ids.erase(it);
								res.set_content("{\"result\" : \"success\", \"general_id\" : " + std::to_string(general_id) + "}", "text/plain");
								return;
							}
						}
						res.set_content("{\"result\" : \"session_not_found\", \"general_id\" : " + std::to_string(general_id) + "}", "text/plain");

						add_cors_headers(res); });

	svr.Post("/send_message", [&](const httplib::Request &req, httplib::Response &res)
					 {
						int session_id = std::stoi(req.get_param_value("session_id"));
						std::string message = req.body;
						unsigned int timestamp = time(NULL);

						for (auto user_session : session_ids)
						{
							if (user_session.session_id == session_id)
							{
								messages.push_back({user_session, message, timestamp});
								std::cout << "Message received: " << message << std::endl;
								res.set_content("{\"result\" : \"success\", \"general_id\" : " + std::to_string(general_id) + "}", "text/plain");
								add_cors_headers(res);
								return;
							}
						}

						res.set_content("{\"result\" : \"session_not_found\", \"general_id\" : " + std::to_string(general_id) + "}", "text/plain");

						add_cors_headers(res); });

	svr.Get("/get_messages", [&](const httplib::Request &req, httplib::Response &res)
					{
						unsigned int timestamp = std::stoi(req.get_param_value("timestamp"));

						std::string response = "{\"result\" : \"success\", \"messages\" : [";
						for (auto message : messages)
						{
							if (message.timestamp > timestamp)
							{
								response += "{\"username\" : \"" + message.user_session.username + "\", \"message\" : \"" + message.message + "\", \"timestamp\" : " + std::to_string(message.timestamp) + "},";
							}
						}
						response += "], \"general_id\" : " + std::to_string(general_id) + "}";
						supListEndComma(response);
						res.set_content(response, "text/plain");

						add_cors_headers(res); });

	svr.listen("0.0.0.0", PORT);

	sqlite3_close(db);
}