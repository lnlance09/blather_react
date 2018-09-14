import './css/index.css';
import { DisplayMetaTags } from '../utils/metaFunctions';
import { Provider } from 'react-redux';
import {
    Container,
    Grid
} from 'semantic-ui-react';
import Authentication from '../components/authentication/v1/';
import React, { Component } from 'react';
import store from '../store';

class SignInPage extends Component {
    constructor(props) {
        super(props)
        const height = window.innerHeight
        const currentState = store.getState()
        if(currentState.user.authenticated && (!currentState.user.verify || currentState.user.emailVerified)) {
            this.props.history.push('/')
        }

        this.state = {
            height
        }
    }

    render() {
        return (
            <Provider store={store}>
                <div className='loginContainer' style={{ height: this.state.height +'px' }}>
                    <DisplayMetaTags page='signin' props={this.props} state={this.state} />
                    <Container>
                        <div className='loginForm'>
                            <Grid textAlign='center' style={{ height: '100%' }} verticalAlign='middle'>
                                <Grid.Column style={{ maxWidth: 450 }}>
                                    <Authentication />
                                </Grid.Column>
                            </Grid>
                        </div>
                    </Container>
                </div>
            </Provider>
        )
    }
}

export default SignInPage