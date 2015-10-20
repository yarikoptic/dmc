import os
from os.path import join as opj
from glob import glob
import json


def str2bool(val):
    if val == 'Yes':
        return True
    elif val == 'No':
        return False
    elif val == 'N/A':
        return None
    else:
        raise ValueError("not a bool")


def multiselect2str(val):
    if isinstance(val, list) and len(val) == 1:
        val = val[0]
    if isinstance(val, list):
        val = ';'.join([s.replace(';', ',').strip() for s in val])
    elif isinstance(val, basestring):
        if ',' in val:
            val = ';'.join([s.strip() for s in val.split(',')])
        else:
            val = ';'.join([s.replace(';', ',').strip() for s in val.split()])
    return val

def val2ratio(val):
    val = val.strip()
    if val == '0% mine /100% shared':
        return 0.0
    elif val == '30% mine / 70% shared':
        return 0.3
    elif val == '50% mine / 50% shared':
        return 0.5
    elif val == '70% mine / 30% shared':
        return 0.7
    elif val == '100% mine /  0% shared':
        return 1.0
    else:
        raise ValueError('unknown ratio')

type_conversion = {
    "server_version": int,
    "client_version": int,
    "submit_date": unicode,
    "submitter_id": unicode,
    "employer": unicode,
    "position": unicode,
    "country": unicode,
    "data_IRB": str2bool,
    "data_published_paper": str2bool,
    "data_shared_publicly_ever": str2bool,
    "data_shared_publicly_num": int,
    "data_consumed_public": int,
    "maintainer": str2bool,
    "hours": int,
    "personal_device": unicode,
    "personal_OS": unicode,
    "personal_OS_linux": unicode,
    "personal_OS_other": unicode,
    "institute_device": unicode,
    "institute_OS": unicode,
    "institute_OS_linux": unicode,
    "institute_OS_other": unicode,
    "personal_institute_usage": val2ratio,
    "social_media": unicode,
    "publications_number": int,
    "publications_number_open_access": int,
    "collaborations": int,
    "collaborations_data": int,
    "collaborations_data_provided": int,
    "code_shared": str2bool,
    "code_shared_method": unicode,
    "tool_manuscripts": unicode,
    "tool_languages": multiselect2str,
    "openness_sw": unicode,
    "openness_hw": unicode,
    "sw_list": multiselect2str,
    "provider_list": multiselect2str,
    "neuro_methods": multiselect2str,
}


def load_record(path):
    """Load a record, validate, convert types, uniformize across versions"""
    rec = json.load(open(path))
    for r in rec:
        if r in type_conversion:
            try:
                rec[r] = type_conversion[r](rec[r])
            except ValueError:
                if type_conversion[r] is int:
                    rec[r] = 0
    return rec


def load_latest_submissions(path):
    """"""
    db = {}
    for sdir in glob(opj(path, '*')):
        if not os.path.isdir(sdir):
            continue
        id_ = os.path.basename(sdir)
        rec = load_record(opj(sdir, 'record'))
        db[id_] = rec
    return db


def db2csv(db, fname):
    import csv
    with open(fname, 'w') as csvfile:
        writer = csv.DictWriter(csvfile, fieldnames=type_conversion.keys())
        writer.writeheader()
        for submitter in db:
            writer.writerow(db[submitter])

if __name__ == '__main__':
    db = load_latest_submissions(opj('public', 'submitters'))
    print('Loaded %i submissions' % len(db))
    db2csv(db, opj('public', 'submitters', 'submissions.csv'))
