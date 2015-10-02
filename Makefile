CHERRYPY_URL = https://pypi.python.org/packages/source/C/CherryPy/CherryPy-3.8.0.tar.gz

all: cherrypy submitters records

submitters:
	# store form submissions for retrieval here
	mkdir -p $@

records:
	# store result records here
	mkdir -p $@

cherrypy:
	wget -O cherrypy.tar.gz $(CHERRYPY_URL)
	tar --transform 's,[A-Za-Z0-9\.-]*,cherrypy,' -xvf cherrypy.tar.gz

distclean:
	-rm -rf cherrypy cherrypy.tar.gz
