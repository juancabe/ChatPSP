#include <iostream>

using namespace std;

void supListEndComma(string &toSup)
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

  string str1 = "cosocos, [wasa]";
  string str2 = "cosocos, [wasa,]";
  string str3 = "cosocos, [wasa, wasa]";

  cout << "Before supListEndComma" << endl;
  cout << "str1: " << str1 << endl;
  cout << "str2: " << str2 << endl;
  cout << "str3: " << str3 << endl
       << endl;

  supListEndComma(str1);
  supListEndComma(str2);
  supListEndComma(str3);

  cout << "After supListEndComma" << endl;
  cout << "str1: " << str1 << endl;
  cout << "str2: " << str2 << endl;
  cout << "str3: " << str3 << endl
       << endl;
}