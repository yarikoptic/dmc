CHERRYPY_URL = https://pypi.python.org/packages/source/C/CherryPy/CherryPy-3.8.0.tar.gz

all: cherrypy public/submitters private/uuids public/records logs

private/uuids:
	# store the mapping between public and private ID
	# THIS DIRECTORY SHOULD NOT BE EXPOSED
	git submodule init
	git submodule update
	mkdir -p $@

public/submitters:
	# store public reference to latest record for a submitter here
	# (subdir per submitter)
	mkdir -p $@
	ln -fs ../../client/stats.html $@/stats.html

public/records:
	# store result records here
	mkdir -p $@

logs:
	# store cherrypy logs here
	mkdir -p $@

cherrypy:
	wget -O cherrypy.tar.gz $(CHERRYPY_URL)
	tar --transform 's,[A-Za-Z0-9\.-]*,cherrypy,' -xvf cherrypy.tar.gz

distclean:
	-rm -rf cherrypy cherrypy.tar.gz
