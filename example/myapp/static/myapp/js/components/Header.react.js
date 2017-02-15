import React from 'react';

const Header = function Header(props) {
  const username = props.currentUser ? props.currentUser.username : 'Anonymous';
  return (<div>Hello, {username}!</div>);
}


Header.propTypes = {
    currentUser: React.PropTypes.object
};

export default Header;
