import os
import cherrypy
import uuid
import hashlib
import json

opj = os.path.join


def is_valid_submission(d):
    """Perform all possible tests and return flag"""
    if 'submitter_id' in d:
        sid = d['submitter_id']
        if '/' in sid:
            # is not a UUID
            return False
        if not os.path.exists(opj('submitter_uuids', sid)):
            # this thing claims it is a recurring submission
            # but we don't know about the one it references
            return False
    return True


class SurveyDB(object):
    @cherrypy.expose
    def index(self):
        return open('client/survey_form.html').read()

    @cherrypy.expose
    @cherrypy.tools.json_in(force=True)
    def submit(self):
        # this is the form content as decoded JSON, aka a dict
        data = cherrypy.request.json
        if not is_valid_submission(data):
            # XXX should be an error of some kind
            return "Not like that my friend"
        # get an ID for this submitter, generate random UUID
        # if none comes with the submission
        # this is the ID one needs to know to retrieve a previous
        # submission to resubmit an update
        submitter_uuid = str(data.get('submitter_uuid', uuid.uuid4()))

        # at this point we trust the UUID (based on the initial checks)

        # submitter ID
        # this is the 'public' submitter reference we use to indicate
        # which record came from whom
        # this is also the ID people can use to retrieve the 'latest'
        # result
        submitter_file = opj('submitter_uuids', submitter_uuid)
        if os.path.exists(submitter_file):
            # we have a previous submission for this UUID, retrieve the ID
            submitter_id = open(submitter_file).read()
            if not len(submitter_id) == 32:
                # we expect an MD5 sum
                raise ValueError("this should not happen")
        else:
            # generate a new ID, add extra randomness so it cannot be
            # guessed from the UUID itself
            # XXX this is the place to make the submitter IDs shorter
            # we talked about some algorithm like the ones URL shorteners
            # use, to keep the resulting reference URL compact
            # even MD5 is too long
            submitter_id = hashlib.md5(
                '%s%s' % (submitter_uuid, uuid.uuid4())).hexdigest()
            # and store for later
            with open(submitter_file, 'w') as _file:
                _file.write(submitter_id)

        # this directory will contain stuff like badges, computed
        # stats, ...
        submitters_dir = opj('submitters', submitter_id)
        if not os.path.exists(submitters_dir):
            os.makedirs(submitters_dir)

        # prep record for storage
        # 1st kill the UUID as the records will be public
        if 'submitter_uuid' in data:
            del data['submitter_uuid']
        # and replace with submitter ID hash
        data['submitter_id'] = submitter_id

        rec_path = opj(submitters_dir, 'record')
        if os.path.exists(rec_path):
            # we have a previous submission, make the record aware of it
            # the ID is the filename where the 'record' link points to
            prev_record_id = os.path.split(os.path.realpath(rec_path))[-1]
            if not len(prev_record_id) == 32:
                # we expect an MD5 sum
                raise ValueError("this should not happen")
            data['prev_record_id'] = prev_record_id

        # record is final, serialize and store using its identity as the name
        record = json.dumps(data)
        record_id = hashlib.md5(record).hexdigest()
        with open(opj('records', record_id), 'w') as _file:
            _file.write(record)

        # finally populate public data for this submitter
        # for now place the latest record in here
        if os.path.exists(rec_path):
            os.unlink(rec_path)
        os.symlink(opj('..', '..', 'records', record_id), rec_path)

        # return private and public IDs to the submitter, they
        # need to be displayed for future reference
        # record ID is not needed, can be obtained via submitter_id
        return str((submitter_uuid, submitter_id))


if __name__ == '__main__':
    cherrypy.quickstart(SurveyDB())
