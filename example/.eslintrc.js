module.exports = {
    "parserOptions": {
        "ecmaVersion": 6,
        "sourceType": "module",
        "ecmaFeatures": {
            "jsx": true
        }
    },
    "plugins": [
        "react",
        "import"
    ],
    "env": {
        "browser": true,
        "es6": true,
        "mocha": true,
    },
    "extends": ["eslint:recommended", "plugin:react/recommended"],
};
