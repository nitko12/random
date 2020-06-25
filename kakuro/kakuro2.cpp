#include <iostream>
#include <array>
#include <tuple>
#include <algorithm>
#include <vector>
#include <string>
using namespace std;

struct comb
{
    tuple<int, int, int> n;
    vector<array<char, 9>> c;
};

struct cons
{
    int v;
    vector<int> c;
};

array<comb, 512> t;

int fac(int n) { return (n <= 1 ? 1 : fac(n - 1) * n); }

void makeTable()
{
    for (int i = 0; i < 512; ++i)
    {
        int cnt = 0, k = 0;
        array<char, 9> t;
        for (int j = 0; j < 9; ++j)
            if (i & (1 << j))
                t[k++] = (cnt += (j + 1), j + 1);
        ::t[i].n = make_tuple(__builtin_popcount(i), cnt, i);
        ::t[i].c.push_back(t);
    }
    sort(t.begin(), t.end(), [](const comb &a, const comb &b) { return a.n < b.n; });
    for (int i = 0; i < 512; ++i)
    {
        t[i].c.resize(fac(get<0>(t[i].n)));
        int k = 0;
        array<char, 9> temp = t[i].c[0];
        auto it = temp.begin();
        advance(it, get<0>(t[i].n));
        do
        {
            t[i].c[k++] = temp;
        } while (next_permutation(temp.begin(), it));
    }
}

vector<vector<pair<char, char>>> k;
vector<vector<int>> coor;

vector<cons> c;

void show()
{
    for (int j = 0; j < k[0].size() * 6 + 1; ++j)
        cout << "-";
    cout << "\n";
    for (int i = 0; i < k.size(); ++i)
    {
        for (int j = 0; j < k[0].size(); ++j)
        {
            cout << (!j ? "|" : "") << (k[i][j].first != -1 && k[i][j].first % 10 == k[i][j].first ? "0" : "") << (int)k[i][j].first << (char)92 << (k[i][j].second != -1 && k[i][j].second % 10 == k[i][j].second ? "0" : "") << (int)k[i][j].second << "|";
        }
        cout << "\n";
        for (int j = 0; j < k[0].size() * 6 + 1; ++j)
            cout << "-";
        cout << "\n";
    }
}

void fcoor(vector<int> &rj)
{
    int cnt = 0;
    coor.resize(k.size());
    for (int i = 0; i < k.size(); ++i)
    {
        coor[i].resize(k[0].size());
        for (int j = 0; j < k[0].size(); ++j)
            if (k[i][j].first == 0)
                coor[i][j] = cnt++;
            else
                coor[i][j] = -1;
    }
    rj.resize(cnt);
}

void printSol(vector<int> &rj)
{
    int cnt = 0;
    for (int j = 0; j < k[0].size() * 6 + 1; ++j)
        cout << "-";
    cout << "\n";
    for (int i = 0; i < k.size(); ++i)
    {
        for (int j = 0; j < k[0].size(); ++j)
        {
            if (k[i][j].first == 0)
                cout << (!j ? "|" : "") << "  " << rj[cnt++] << "  |";
            else
                cout << (!j ? "|" : "") << (k[i][j].first != -1 && k[i][j].first % 10 == k[i][j].first ? "0" : "") << (int)k[i][j].first << (char)92 << (k[i][j].second != -1 && k[i][j].second % 10 == k[i][j].second ? "0" : "") << (int)k[i][j].second << "|";
        }
        cout << "\n";
        for (int j = 0; j < k[0].size() * 6 + 1; ++j)
            cout << "-";
        cout << "\n";
    }
}

void solve(int n, vector<int> rj)
{
    //cout << n << "\n";
    //printSol(rj);
    if (n == c.size())
    {
        printSol(rj);
        return;
    }
    comb temp;
    temp.n = make_tuple(c[n].c.size(), c[n].v, 0);
    auto it1 = lower_bound(::t.begin(), ::t.end(), temp, [](const comb &a, const comb &b) { return get<0>(a.n) < get<0>(b.n); }),
         it2 = upper_bound(::t.begin(), ::t.end(), temp, [](const comb &a, const comb &b) { return get<0>(a.n) < get<0>(b.n); });
    auto it3 = lower_bound(it1, it2, temp, [](const comb &a, const comb &b) { return get<1>(a.n) < get<1>(b.n); }),
         it4 = upper_bound(it1, it2, temp, [](const comb &a, const comb &b) { return get<1>(a.n) < get<1>(b.n); });
    for (; distance(it3, it4); advance(it3, 1))
    {
        for (auto i : (*it3).c)
        {
            bool failed = 0;
            vector<int> pr = rj;
            for (int j = 0; j < get<0>((*it3).n); ++j)
            {
                if (rj[c[n].c[j]] == 0 || rj[c[n].c[j]] == i[j])
                    rj[c[n].c[j]] = i[j];
                else
                {
                    failed = 1;
                    break;
                }
            }
            if (failed)
            {
                rj = pr;
                continue;
            }
            solve(n + 1, rj);
            rj = pr;
        }
    }
}

int main()
{
    makeTable();
    int n, m;
    cin >> n >> m;
    k.resize(n);
    for (int i = 0; i < n; ++i)
    {
        k[i].resize(m);
        string s;
        cin >> s;
        for (int j = 0; j < m * 4; j += 4)
        {
            string s1 = s.substr(j, 2), s2 = s.substr(j + 2, 2);
            if (s1.compare("XX") == 0)
                k[i][j / 4].first = -1;
            else
                k[i][j / 4].first = stoi(s1);
            if (s2.compare("XX") == 0)
                k[i][j / 4].second = -1;
            else
                k[i][j / 4].second = stoi(s2);
        }
    }
    show();
    vector<int> rj;
    fcoor(rj);
    for (int i = 0; i < n; ++i)
    {
        for (int j = 0; j < m; ++j)
        {
            if (k[i][j].first > 0)
            {
                int t = i;
                cons c;
                c.v = k[i][j].first;
                while (++t < n && k[t][j].first == 0)
                    c.c.push_back(coor[t][j]);
                ::c.push_back(c);
            }
            if (k[i][j].second > 0)
            {
                int t = j;
                cons c;
                c.v = k[i][j].second;
                while (++t < m && k[i][t].second == 0)
                    c.c.push_back(coor[i][t]);
                ::c.push_back(c);
            }
        }
    }
    for (auto i : c)
    {
        cout << i.v << ":\n";
        for (auto j : i.c)
            cout << j << " ";
        cout << "\n";
    }
    solve(0, rj);
    return 0;
}