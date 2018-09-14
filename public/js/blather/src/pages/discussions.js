import './css/index.css';
import { DisplayMetaTags } from '../utils/metaFunctions';
import { Provider, connect } from 'react-redux';
import { 
    Container,
    Header
} from 'semantic-ui-react';
import DiscussionsList from '../components/discussionsList/v1/';
import PageFooter from '../components/footer/v1/';
import PageHeader from '../components/header/v1/';
import React, { Component } from 'react';
import store from '../store';

class DiscussionsPage extends Component {
    constructor(props) {
        super(props)
        document.body.style.background = '#fff'
        const height = window.innerHeight
        const currentState = store.getState()
        const bearer = currentState.user.bearer
        const authenticated = currentState.user.authenticated

        this.state = {
            authenticated,
            bearer,
            height
        }
    }

    render() {
        const { bearer, height } = this.state
        return (
            <Provider store={store}>
                <div className='discussionsPage'>
                    <DisplayMetaTags page='discussions' props={this.props} state={this.state} />
                    <PageHeader
                        {...this.props}
                    />
                    <Container
                        className='mainContainer'
                        style={{ minHeight: height +'px' }}
                        textAlign='left'
                    >
                        <Header as='h1'>
                            Discussions
                            <Header.Subheader>
                                Honest and evidence based
                            </Header.Subheader>
                        </Header>
                        <Container className='discussionsContainer'>
                            <DiscussionsList 
                                bearer={bearer}
                                includeFilter
                                {...this.props}
                            />
                        </Container>
                    </Container>
                    <PageFooter />
                </div>
            </Provider>
        )
    }
}

const mapStateToProps = (state, ownProps) => {
    return {
        ...state.page,
        ...ownProps
    }
}

export default connect(mapStateToProps, { })(DiscussionsPage);
