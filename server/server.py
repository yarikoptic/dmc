import sys
import cherrypy

class Root(object):
    @cherrypy.expose
    @cherrypy.tools.json_in(force=True)
    def index(self):
        data = cherrypy.request.json
        print('MOREFUCK',sys.stderr)
        print('JUSTFUCK')
        print data
        return "FUCK"

    @cherrypy.expose
    def form(self):
        return open('simple_post.html').read()

if __name__ == '__main__':
   cherrypy.quickstart(Root())
