import os
import cherrypy
import uuid
import hashlib

opj = os.path.join


def is_valid_submission(d):
    """Perform all possible tests and return flag"""
    if 'submitter_id' in d:
        sid = d['submitter_id']
        if '/' in sid:
            # is a UUID
            return False
        if not os.path.exists(opj('submitters', sid)):
            # this thing claims it is a recurring submission
            # but we don't know about the one it references
            return False
    return True


class Root(object):
    @cherrypy.expose
    def index(self):
        return open('client/survey_form.html').read()

    @cherrypy.expose
    @cherrypy.tools.json_in(force=True)
    def submit(self):
        # this is the form content as decoded JSON, aka a dict
        data = cherrypy.request.json
        if not is_valid_submission(data):
            return "Not like that my friend"
        # get an ID for this submitter, generate random UUID
        # if none comes with the submission
        submitter_id = data.get('submitter_id', uuid.uuid4())
        # give each submission a unique name
        record_id = hashlib.md5(str(data)).hexdigest()
        return str((submitter_id, record_id))


if __name__ == '__main__':
    cherrypy.quickstart(Root())
