import './style.css';
import { logout } from '../../authentication/v1/actions';
import { Provider, connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
    Container,
    Dropdown,
    Menu
} from 'semantic-ui-react';
import Logo from './images/logo.svg';
import NavSearch from '../../search/v1/';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactSVG from 'react-svg';
import store from '../../../store';

class Header extends Component {
    constructor(props) {
        super(props)
        this.onLogout = this.onLogout.bind(this)
    }

    onLogout() {
        this.props.logout()
        this.setState({ authenticated: false })
        this.props.history.push('/')
    }

    render() {
        const loginButton = props => {
            if(props.authenticated) {
                return (
                    <Dropdown
                        className='dropDownMenu right'
                        icon={false}
                        item
                        style={{ borderRadius: '0' }}
                        text={props.data.name}
                    >
                        <Dropdown.Menu>
                            <Dropdown.Item onClick={() => props.history.push(`/users/${props.data.username}`)}>
                                Profile
                            </Dropdown.Item>
                            <Dropdown.Item onClick={() => props.history.push(`/settings`)}>
                                Settings
                            </Dropdown.Item>
                            <Dropdown.Item onClick={this.onLogout}>
                                Log out
                            </Dropdown.Item>
                        </Dropdown.Menu>
                    </Dropdown>
                )
            } else {
                return (
                    <Menu.Item
                        className='signInLink'
                        direction='right'
                        onClick={() => this.props.history.push('/signin')}
                        position='right'
                    >
                        Sign In
                    </Menu.Item>
                )
            }
        }

        return (
            <Provider store={store}>
                <div className='pageHeader'>
                    <Menu
                        borderless
                        className='globalHeader'
                        fitted='vertically'
                        fixed='top' 
                        inverted
                    >
                        <Container className='headerContainer'>
                            <Menu.Item className='headerMenuItem'>
                                <ReactSVG
                                    className='headerLogo'
                                    evalScripts='always'
                                    onClick={() => {
                                        this.props.history.push('/')
                                    }}
                                    path={Logo}
                                    svgClassName='svgHeaderLogo'
                                />
                                <NavSearch 
                                    history={this.props.history}
                                />
                            </Menu.Item>
                            <Menu.Item className='fallaciesLink'>
                                <Link to='/fallacies'>Fallacies</Link>
                            </Menu.Item>
                            <Menu.Item className='discussionsLink'>
                                <Link to='/discussions'>Discussions</Link>
                            </Menu.Item>
                            {loginButton(this.props)}
                        </Container>
                    </Menu>
                </div>
            </Provider>
        );
    }
}

Header.defaultProps = {
    authenticated: false,
    logout: logout
}

Header.propTypes = {
    authenticated: PropTypes.bool,
    logout: PropTypes.func
}

const mapStateToProps = (state, ownProps) => ({
    ...state.user,
    ...ownProps
})

export default connect(mapStateToProps, { logout })(Header)