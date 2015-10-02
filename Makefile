CHERRYPY_URL = https://pypi.python.org/packages/source/C/CherryPy/CherryPy-3.8.0.tar.gz

all: cherrypy submitters submitter_uuids records

submitter_uuids:
	# store the mapping between public and private ID
	# THIS DIRECTORY SHOULD NOT BE EXPOSED
	mkdir -p $@

submitters:
	# store public reference to latest record for a submitter here
	# (subdir per submitter)
	mkdir -p $@

records:
	# store result records here
	mkdir -p $@

cherrypy:
	wget -O cherrypy.tar.gz $(CHERRYPY_URL)
	tar --transform 's,[A-Za-Z0-9\.-]*,cherrypy,' -xvf cherrypy.tar.gz

distclean:
	-rm -rf cherrypy cherrypy.tar.gz
