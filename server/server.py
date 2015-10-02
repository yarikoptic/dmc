import sys
import cherrypy

class Root(object):
    @cherrypy.expose
    def index(self):
        return open('client/survey_form.html').read()

    @cherrypy.expose
    @cherrypy.tools.json_in(force=True)
    def submit(self):
        data = cherrypy.request.json
        print('MOREFUCK',sys.stderr)
        print('JUSTFUCK')
        print data
        return "FUCK"


if __name__ == '__main__':
   cherrypy.quickstart(Root())
