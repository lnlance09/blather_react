import './css/index.css';
import { adjustTimezone } from '../utils/dateFunctions';
import { DisplayMetaTags } from '../utils/metaFunctions';
// import { } from './actions/tags';
import Moment from 'react-moment';
import { connect, Provider } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
    Button,
    Container,
    Form,
    Grid,
    Header,
    Image,
    Segment,
    TextArea
} from 'semantic-ui-react';
import PageFooter from '../components/footer/v1/';
import PageHeader from '../components/header/v1/';
import ParagraphPic from '../images/short-paragraph.png';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import store from '../store';
import TitleHeader from '../components/titleHeader/v1/';

class Tags extends Component {
    constructor(props) {
        super(props)
        const height = window.innerHeight
        const name = parseInt(this.props.match.params.name,10)
        const currentState = store.getState()
        const authenticated = currentState.user.authenticated
        const bearer = currentState.user.bearer
        const userId = parseInt(currentState.user.data.id,10)
        this.state = {
            authenticated,
            bearer,
            height,
            name,
            userId
        }
    }

    render() {
        const { activeItem, authenticated, bearer, height, msg, name } = this.state
        const TagTitle = ({props}) => {
            const subheader = (
                <div>
                    {props.createdBy && (
                        <div>
                            Created <Moment date={adjustTimezone(props.createdAt)} fromNow interval={60000} /> by <Link to={`/users/${props.createdBy.username}`}>{props.createdBy.name}</Link>
                        </div>
                    )}
                </div>
            )
            return (
                <TitleHeader 
                    bearer={bearer}
                    canEdit={authenticated}
                    id={name}
                    subheader={subheader}
                    title={props.title}
                    type='tag'
                />
            )
        }

        return (
            <Provider store={store}>
                <div className='tagsPage' style={{ height: height +'px' }}>
                    <DisplayMetaTags page='tags' props={this.props} state={this.state} />
                    <PageHeader
                        {...this.props}
                    />
                    <Container
                        className='mainContainer'
                        style={{ minHeight: height +'px' }}
                        textAlign='left'
                    >
                        <TagTitle props={this.props} />
                        <Grid>
                            <Grid.Column className='leftSide' width={3}>
                                
                            </Grid.Column>
                            <Grid.Column width={13}>
                                <Segment loading>
                                    <Image fluid src={ParagraphPic} />
                                    <Image fluid src={ParagraphPic} />
                                    <Image fluid src={ParagraphPic} />
                                    <Image fluid src={ParagraphPic} />
                                    <Image fluid src={ParagraphPic} />
                                </Segment>
                            </Grid.Column>
                        </Grid>
                    </Container>
                    <PageFooter />
                </div>
            </Provider>
        )
    }
}

Tags.propTypes = {
    
}

Tags.defaultProps = {
    
}

const mapStateToProps = (state, ownProps) => {
    return {
        ...state.tag,
        ...ownProps
    }
}

export default connect(mapStateToProps, { })(Tags)