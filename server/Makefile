main: main.cpp sqlite3.o
	g++ -o main main.cpp sqlite3.o -lpthread -ldl -O3 -I/usr/local/ssl/include -L/usr/local/ssl/lib64 -lssl -lcrypto

sqlite3.o: ./sqlite/sqlite3.c ./sqlite/sqlite3.h
	gcc -c ./sqlite/sqlite3.c