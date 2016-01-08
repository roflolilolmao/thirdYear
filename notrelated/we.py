import urllib2
from BeautifulSoup import BeautifulSoup
import sys


html = urllib2.urlopen('http://www.hpfanfiction.org/fr/viewstory.php?sid=14578').read()

parsed_html = BeautifulSoup(html)
p = parsed_html.body.find('div', attrs={'id':'story'}).text
# print(''.join([unichr(i) for i in parsed_html.body.find('div', attrs={'id':'story'}).text]))
s = ''
l = {}
salut = {u'\xe0':'?', u'\xe2':'?', u'\xe7':'?', u'\xe9':'Z', u'\xe8':'?', u'\xab':'?',
         u'\xea':'?', u'\xef':'?', u'\xee':'?', u'\xf4':'?', u'\xf9':'?', u'\xfb':'?', u'\xbb':'?'}
c = 0
for i in p:
    # c += 1
    try:
        print(i)
        s += i
    except UnicodeEncodeError as e:
        print(e)
        l[e[1]] = 14
        s += salut[e[1]]
    # if c > 3456789:
        # break
print(s)
# print([i for i, j in l.items()])