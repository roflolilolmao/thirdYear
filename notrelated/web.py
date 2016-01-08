import urllib2
from BeautifulSoup import BeautifulSoup
import re

url = 'http://www.hpfanfiction.org/fr/viewstory.php?sid=14578&textsize=0&chapter='

with open('test.html', 'w') as f:
    f.write('<!doctype html><html><head><meta charset="utf-8"/></head><body>')
    for i in range(101):
        html = urllib2.urlopen(url + str(i)).read()
        htmlb = re.sub('<br />', '\n', html)
        parsed_html = BeautifulSoup(htmlb)
        p = parsed_html.body.find('div', attrs={'id':'story'}).text

        s = p.encode('utf8')
        q = re.sub('\n', '<br />', s)
        f.write(q)
    f.write('</body></html>')