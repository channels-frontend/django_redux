import os
from setuptools import setup, find_packages

VERSION = '1.0.0'


f = open(os.path.join(os.path.dirname(__file__), 'README.rst'))
readme = f.read()
f.close()

setup(
    name='django_redux',
    version=VERSION,
    description='A re-usable bridge between Django channels and Redux Edit',
    long_description=readme,
    author='Flavio Curella',
    author_email='flavio.curella@gmail.com',
    url='https://github.com/channels-frontend/django_redux',
    include_package_data=True,
    packages=find_packages(exclude=['example', 'tests']),
    zip_safe=False,
    classifiers=[
        'Development Status :: 4 - Beta',
        'Environment :: Web Environment',
        'Intended Audience :: Developers',
        'Operating System :: OS Independent',
        'Programming Language :: Python :: 2',
        'Programming Language :: Python :: 3',
        'Framework :: Django',
    ],
    install_requires=[
        "channels",
        "Django",
    ],
    setup_requires=[
        "channels-redis",
        "pytest-runner",
        "pytest-asyncio",
        "pytest-django",
    ],
)
