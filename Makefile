all: prep public/submitters private/uuids public/records

prep:
	git submodule init
	git submodule update

private/uuids: prep
	# store the mapping between public and private ID
	# THIS DIRECTORY SHOULD NOT BE EXPOSED
	mkdir -p $@

public/submitters: prep
	# store public reference to latest record for a submitter here
	# (subdir per submitter)
	mkdir -p $@
	ln -fs ../../client/stats.html $@/stats.html

public/records: prep
	# store result records here
	mkdir -p $@

.PHONY: prep
