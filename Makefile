release:
	rm -rf dist
	python setup.py sdist bdist_wheel
	twine upload dist/*
	cd django_redux/static/django_redux && npm publish && npm run docs &&

update_docs:
	cd django_redux/static/django_redux && npm run docs
