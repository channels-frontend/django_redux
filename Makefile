release:
	rm -rf dist
	python setup.py sdist bdist_wheel
	twine upload dist/*
	cd node && npm publish

update_docs:
	cd node && npm run docs
