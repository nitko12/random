#include <EEPROM.h>
//1.0 verzija, ima bug sa prikazom 3 decimale, ne znam zasto 
#define periodProvjere 200 

//zajednicke katode
int pinoviZnamenki[3] = {13, A1, A2};
//znamenke 0,1,2,3,4,5,6,7,8,9

//  --0--
// |      |
// 1      2
// |      |
//  --3--
// |      |
// 4      5
// |      |
//  --6--   7*

int pinovi[8] = {12, 11, 10, 6, 5, 7, 9, 8};
bool pinoviBrojeva[10][8] = {
    {1, 1, 1, 0, 1, 1, 1, 0},
    {0, 0, 1, 0, 0, 1, 0, 0},
    {1, 0, 1, 1, 1, 0, 1, 0},
    {1, 0, 1, 1, 0, 1, 1, 0},
    {0, 1, 1, 1, 0, 1, 0, 0},
    {1, 1, 0, 1, 0, 1, 1, 0},
    {1, 1, 0, 1, 1, 1, 1, 0},
    {1, 0, 1, 0, 0, 1, 0, 0},
    {1, 1, 1, 1, 1, 1, 1, 0},
    {1, 1, 1, 1, 0, 1, 1, 0},
};

//                       +  -  selection
bool stanjaDugmadi[3] = {1, 1, 1};
int pinoviDugmadi[3]   =  {A5, A4, 3};

int meni = 0; // 0 trenutna temperatura, 1 visa granica, 0 niza granica

float donjaGranica, gornjaGranica;

int pinoviLedica[3] = {A0, A3};

int eeAdresa1 = 0, eeAdresa2 = sizeof(float);

int stanjeTermistora = 0; // 0 ne treba palit u granicama, 1 treba palit u granicama

int relej = 2;

void setup()
{
  pinMode(A6, INPUT);
  //pinovi znamenki
  for (int i = 0; i < 3; ++i)
  {
    pinMode(pinoviZnamenki[i], OUTPUT);
  }
  for (int i = 0; i < 8; ++i)
  {
    pinMode(pinovi[i], OUTPUT);
  }
  digitalWrite(pinoviZnamenki[0], 1);
  digitalWrite(pinoviZnamenki[1], 1);
  digitalWrite(pinoviZnamenki[2], 1);

  for (int i = 0; i < 3; ++i)
  {
    pinMode(pinoviDugmadi[i], INPUT_PULLUP);
  }

  for (int i = 0; i < 2; ++i)
  {
    pinMode(pinoviLedica[i], OUTPUT);
  }
  pinMode(relej, OUTPUT);
  EEPROM.get(eeAdresa1, donjaGranica);
  EEPROM.get(eeAdresa2, gornjaGranica);
}

void loop()
{
  int x = analogRead(A6);
  float t = (0.00004895 * x * x) + (0.05394 * x) + 7.929;
  
  if(t <= donjaGranica) {
    digitalWrite(relej, 1);
    stanjeTermistora = 0;
  } else if(t > donjaGranica && t <= gornjaGranica) {
    if(stanjeTermistora)
      digitalWrite(relej, 0);
    else
      digitalWrite(relej, 1);
  } else if(t > gornjaGranica) {
    digitalWrite(relej, 0);
    stanjeTermistora = 1;
  }
  
  int len = log10(abs(t)) + 1;
  int temp;
  
  if(meni == 0) for (int h = 0; h < periodProvjere; ++h) {
    bool br = 0;
    for(int i = 0; i < 3; ++i) {
      if(digitalRead(pinoviDugmadi[i]) == 0 && stanjaDugmadi[i] == 1) {
        stanjaDugmadi[i] = 0;
        if(i==2) {
          meni = (meni + 1) % 3;
          digitalWrite(pinoviLedica[0], 1);
          br = 1;
        }
        
      } else if(digitalRead(pinoviDugmadi[i]) == 1 && stanjaDugmadi[i] == 0) {
        stanjaDugmadi[i] = 1;
      }
    }
    if(br)
      break;
    if (t < 0)
    {
      // - znak
      digitalWrite(pinoviZnamenki[0], 0);
      digitalWrite(pinovi[3], 1);
      delay(1);
      digitalWrite(pinoviZnamenki[0], 1);
      digitalWrite(pinovi[3], 0);

      if (len == 1)
      {
        temp = t;
        digitalWrite(pinoviZnamenki[1], 0);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], pinoviBrojeva[temp][i]);
        }
        digitalWrite(pinovi[7], 1);
        delay(1);
        digitalWrite(pinovi[7], 0);
        digitalWrite(pinoviZnamenki[1], 1);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], 0);
        }
        temp = (int)(t * 10) % 10;
        digitalWrite(pinoviZnamenki[2], 0);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], pinoviBrojeva[temp][i]);
        }
        delay(1);
        digitalWrite(pinoviZnamenki[2], 1);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], 0);
        }
      }
      else if (len == 2)
      {
        temp = t / 10;
        digitalWrite(pinoviZnamenki[1], 0);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], pinoviBrojeva[temp][i]);
        }
        delay(1);
        digitalWrite(pinoviZnamenki[1], 1);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], 0);
        }
        temp = (int)t % 10;
        digitalWrite(pinoviZnamenki[2], 0);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], pinoviBrojeva[temp][i]);
        }
        digitalWrite(pinovi[7], 1);
        delay(1);
        digitalWrite(pinovi[7], 0);
        digitalWrite(pinoviZnamenki[2], 1);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], 0);
        }
      }
    }
    else
    {
      if (len == 1)
      {
        temp = t;
        digitalWrite(pinoviZnamenki[0], 0);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], pinoviBrojeva[temp][i]);
        }
        digitalWrite(pinovi[7], 1);
        delay(1);
        digitalWrite(pinovi[7], 0);
        digitalWrite(pinoviZnamenki[0], 1);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], 0);
        }
        temp = (int)(t * 10) % 10;
        digitalWrite(pinoviZnamenki[1], 0);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], pinoviBrojeva[temp][i]);
        }
        delay(1);
        digitalWrite(pinoviZnamenki[1], 1);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], 0);
        }
        temp = (int)(t * 100) % 10;
        digitalWrite(pinoviZnamenki[2], 0);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], pinoviBrojeva[temp][i]);
        }
        delay(1);
        digitalWrite(pinoviZnamenki[2], 1);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], 0);
        }
      }
      else if (len == 2)
      {
        temp = t / 10;
        digitalWrite(pinoviZnamenki[0], 0);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], pinoviBrojeva[temp][i]);
        }
        delay(1);
        digitalWrite(pinoviZnamenki[0], 1);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], 0);
        }
        temp = (int)t % 10;
        digitalWrite(pinoviZnamenki[1], 0);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], pinoviBrojeva[temp][i]);
        }
        digitalWrite(pinovi[7], 1);
        delay(1);
        digitalWrite(pinovi[7], 0);
        digitalWrite(pinoviZnamenki[1], 1);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], 0);
        }
        temp = (int)(t * 10) % 10;
        digitalWrite(pinoviZnamenki[2], 0);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], pinoviBrojeva[temp][i]);
        }
        delay(1);
        digitalWrite(pinoviZnamenki[2], 1);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], 0);
        }
      }
    }
  } else if(meni == 1) {
    for(int h = 0; h < periodProvjere; ++h) {
      bool br = 0;
      for(int i = 0; i < 3; ++i) {
        if(digitalRead(pinoviDugmadi[i]) == 0 && stanjaDugmadi[i] == 1) {
          stanjaDugmadi[i] = 0;
          if(i==2) {
            meni = (meni + 1) % 3;
            digitalWrite(pinoviLedica[0], 0);
            digitalWrite(pinoviLedica[1], 1);
            br = 1;
            float data = 0.0;
            EEPROM.get(eeAdresa2, data);
            if(fabs(data - gornjaGranica) > 0.001)
              EEPROM.put(eeAdresa2, gornjaGranica);
          }
          if(i==0) {
            // +
            if(gornjaGranica < 50)
              gornjaGranica+=0.5;
          }
          else if(i==1) {
            // -
            if(gornjaGranica > 15 && gornjaGranica > donjaGranica + 0.6)
              gornjaGranica-=0.5;
          }
          
        } else if(digitalRead(pinoviDugmadi[i]) == 1 && stanjaDugmadi[i] == 0) {
          stanjaDugmadi[i] = 1;
        }
        
    }
    if(br)
      break;
    //--------------------------
    if (gornjaGranica < 0)
    {
      // - znak
      digitalWrite(pinoviZnamenki[0], 0);
      digitalWrite(pinovi[3], 1);
      delay(1);
      digitalWrite(pinoviZnamenki[0], 1);
      digitalWrite(pinovi[3], 0);

      if (len == 1)
      {
        temp = gornjaGranica;
        digitalWrite(pinoviZnamenki[1], 0);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], pinoviBrojeva[temp][i]);
        }
        digitalWrite(pinovi[7], 1);
        delay(1);
        digitalWrite(pinovi[7], 0);
        digitalWrite(pinoviZnamenki[1], 1);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], 0);
        }
        temp = (int)(gornjaGranica * 10) % 10;
        digitalWrite(pinoviZnamenki[2], 0);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], pinoviBrojeva[temp][i]);
        }
        delay(1);
        digitalWrite(pinoviZnamenki[2], 1);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], 0);
        }
      }
      else if (len == 2)
      {
        temp = gornjaGranica / 10;
        digitalWrite(pinoviZnamenki[1], 0);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], pinoviBrojeva[temp][i]);
        }
        delay(1);
        digitalWrite(pinoviZnamenki[1], 1);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], 0);
        }
        temp = (int)gornjaGranica % 10;
        digitalWrite(pinoviZnamenki[2], 0);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], pinoviBrojeva[temp][i]);
        }
        digitalWrite(pinovi[7], 1);
        delay(1);
        digitalWrite(pinovi[7], 0);
        digitalWrite(pinoviZnamenki[2], 1);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], 0);
        }
      }
    }
    else
    {
      if (len == 1)
      {
        temp = gornjaGranica;
        digitalWrite(pinoviZnamenki[0], 0);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], pinoviBrojeva[temp][i]);
        }
        digitalWrite(pinovi[7], 1);
        delay(1);
        digitalWrite(pinovi[7], 0);
        digitalWrite(pinoviZnamenki[0], 1);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], 0);
        }
        temp = (int)(gornjaGranica * 10) % 10;
        digitalWrite(pinoviZnamenki[1], 0);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], pinoviBrojeva[temp][i]);
        }
        delay(1);
        digitalWrite(pinoviZnamenki[1], 1);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], 0);
        }
        temp = (int)(gornjaGranica * 100) % 10;
        digitalWrite(pinoviZnamenki[2], 0);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], pinoviBrojeva[temp][i]);
        }
        delay(1);
        digitalWrite(pinoviZnamenki[2], 1);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], 0);
        }
      }
      else if (len == 2)
      {
        temp = gornjaGranica / 10;
        digitalWrite(pinoviZnamenki[0], 0);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], pinoviBrojeva[temp][i]);
        }
        delay(1);
        digitalWrite(pinoviZnamenki[0], 1);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], 0);
        }
        temp = (int)gornjaGranica % 10;
        digitalWrite(pinoviZnamenki[1], 0);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], pinoviBrojeva[temp][i]);
        }
        digitalWrite(pinovi[7], 1);
        delay(1);
        digitalWrite(pinovi[7], 0);
        digitalWrite(pinoviZnamenki[1], 1);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], 0);
        }
        temp = (int)(gornjaGranica * 10) % 10;
        digitalWrite(pinoviZnamenki[2], 0);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], pinoviBrojeva[temp][i]);
        }
        delay(1);
        digitalWrite(pinoviZnamenki[2], 1);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], 0);
        }
      }
    }
    //--------------------------
    }
  } else if(meni == 2) {
    for(int h = 0; h < periodProvjere; ++h) {
      bool br = 0;
      for(int i = 0; i < 3; ++i) {
        if(digitalRead(pinoviDugmadi[i]) == 0 && stanjaDugmadi[i] == 1) {
          stanjaDugmadi[i] = 0;
          if(i==2) {
            meni = (meni + 1) % 3;
            digitalWrite(pinoviLedica[1], 0);
            br = 1;
            float data = 0.0;
            EEPROM.get(eeAdresa1, data);
            if(fabs(data - donjaGranica) > 0.001)
              EEPROM.put(eeAdresa1, donjaGranica);
          }
          if(i==0) {
            // +
            if(donjaGranica < 50 && donjaGranica < gornjaGranica - 0.6)
              donjaGranica+=0.5;
          }
          else if(i==1) {
            // -
            if(donjaGranica > 15)
              donjaGranica-=0.5;
          }
        } else if(digitalRead(pinoviDugmadi[i]) == 1 && stanjaDugmadi[i] == 0) {
          stanjaDugmadi[i] = 1;
        }
    }
    if(br)
      break;
    //--------------------------
    if (donjaGranica < 0)
    {
      // - znak
      digitalWrite(pinoviZnamenki[0], 0);
      digitalWrite(pinovi[3], 1);
      delay(1);
      digitalWrite(pinoviZnamenki[0], 1);
      digitalWrite(pinovi[3], 0);

      if (len == 1)
      {
        temp = donjaGranica;
        digitalWrite(pinoviZnamenki[1], 0);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], pinoviBrojeva[temp][i]);
        }
        digitalWrite(pinovi[7], 1);
        delay(1);
        digitalWrite(pinovi[7], 0);
        digitalWrite(pinoviZnamenki[1], 1);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], 0);
        }
        temp = (int)(donjaGranica * 10) % 10;
        digitalWrite(pinoviZnamenki[2], 0);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], pinoviBrojeva[temp][i]);
        }
        delay(1);
        digitalWrite(pinoviZnamenki[2], 1);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], 0);
        }
      }
      else if (len == 2)
      {
        temp = donjaGranica / 10;
        digitalWrite(pinoviZnamenki[1], 0);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], pinoviBrojeva[temp][i]);
        }
        delay(1);
        digitalWrite(pinoviZnamenki[1], 1);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], 0);
        }
        temp = (int)donjaGranica % 10;
        digitalWrite(pinoviZnamenki[2], 0);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], pinoviBrojeva[temp][i]);
        }
        digitalWrite(pinovi[7], 1);
        delay(1);
        digitalWrite(pinovi[7], 0);
        digitalWrite(pinoviZnamenki[2], 1);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], 0);
        }
      }
    }
    else
    {
      if (len == 1)
      {
        temp = donjaGranica;
        digitalWrite(pinoviZnamenki[0], 0);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], pinoviBrojeva[temp][i]);
        }
        digitalWrite(pinovi[7], 1);
        delay(1);
        digitalWrite(pinovi[7], 0);
        digitalWrite(pinoviZnamenki[0], 1);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], 0);
        }
        temp = (int)(donjaGranica * 10) % 10;
        digitalWrite(pinoviZnamenki[1], 0);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], pinoviBrojeva[temp][i]);
        }
        delay(1);
        digitalWrite(pinoviZnamenki[1], 1);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], 0);
        }
        temp = (int)(donjaGranica * 100) % 10;
        digitalWrite(pinoviZnamenki[2], 0);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], pinoviBrojeva[temp][i]);
        }
        delay(1);
        digitalWrite(pinoviZnamenki[2], 1);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], 0);
        }
      }
      else if (len == 2)
      {
        temp = donjaGranica / 10;
        digitalWrite(pinoviZnamenki[0], 0);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], pinoviBrojeva[temp][i]);
        }
        delay(1);
        digitalWrite(pinoviZnamenki[0], 1);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], 0);
        }
        temp = (int)donjaGranica % 10;
        digitalWrite(pinoviZnamenki[1], 0);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], pinoviBrojeva[temp][i]);
        }
        digitalWrite(pinovi[7], 1);
        delay(1);
        digitalWrite(pinovi[7], 0);
        digitalWrite(pinoviZnamenki[1], 1);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], 0);
        }
        temp = (int)(donjaGranica * 10) % 10;
        digitalWrite(pinoviZnamenki[2], 0);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], pinoviBrojeva[temp][i]);
        }
        delay(1);
        digitalWrite(pinoviZnamenki[2], 1);
        for (int i = 0; i < 8; ++i)
        {
          digitalWrite(pinovi[i], 0);
        }
      }
    }
    //--------------------------
    }
  }
} 