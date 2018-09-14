import './css/index.css';
import { DisplayMetaTags } from '../utils/metaFunctions';
import { sendContactMsg } from './actions';
import { connect, Provider } from 'react-redux';
import { 
    Button,
    Container,
    Form,
    Header,
    TextArea
} from 'semantic-ui-react';
import PageFooter from '../components/footer/v1/';
import PageHeader from '../components/header/v1/';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import store from '../store';

class TagsPage extends Component {
    constructor(props) {
        super(props)
        document.body.style.background = '#fff'
        const height = window.innerHeight
        this.state = {
            height
        }
    }

    componentWillMount() {
        
    }

    render() {
        const { activeItem, height, msg } = this.state

        return (
            <Provider store={store}>
                <div className='aboutPage' style={{ height: height +'px' }}>
                    <DisplayMetaTags page='about' props={this.props} state={this.state} />
                    <PageHeader
                        {...this.props}
                    />
                    <Container
                        className='mainContainer forText'
                        style={{ minHeight: height +'px' }}
                        textAlign='left'
                    >
                        
                    </Container>
                    <PageFooter />
                </div>
            </Provider>
        )
    }
}

TagsPage.propTypes = {
    
}

TagsPage.defaultProps = {
    
}

const mapStateToProps = (state, ownProps) => {
    return {
        ...state.tag,
        ...ownProps
    }
}

export default connect(mapStateToProps, { })(TagsPage)
