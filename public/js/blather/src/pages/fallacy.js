import './css/index.css';
import { DisplayMetaTags } from '../utils/metaFunctions';
import { fetchCommentCount, fetchFallacy, updateFallacy } from './actions/fallacy';
import { Provider, connect } from 'react-redux';
import { Link } from 'react-router-dom';
import { 
    Container,
    Grid,
    Menu
} from 'semantic-ui-react';
import { adjustTimezone } from '../utils/dateFunctions';
import Comments from '../components/comments/v1/';
import Conversation from '../components/conversation/v1/';
import FallacyExample from '../components/fallacyExample/v1/';
import FallacyRef from '../components/fallacyRef/v1/';
import Moment from 'react-moment';
import PageFooter from '../components/footer/v1/';
import PageHeader from '../components/header/v1/';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import store from '../store';
import TagsCard from '../components/tagsCard/v1/';
import TitleHeader from '../components/titleHeader/v1/';

class Fallacy extends Component {
    constructor(props) {
        super(props)
        const height = window.innerHeight
        const id = parseInt(this.props.match.params.id,10)
        const currentState = store.getState()
        const authenticated = currentState.user.authenticated
        const bearer = currentState.user.bearer
        const userId = parseInt(currentState.user.data.id,10)

        this.state = { 
            activeItem: 'conversation',
            authenticated,
            bearer,
            editing: false,
            height,
            id,
            show: false,
            userId,
            value: ''
        }
    }

    componentDidMount() {
        this.props.fetchCommentCount({ id: this.state.id })
        this.props.fetchFallacy({
            bearer: this.state.bearer,
            id: this.state.id
        })
    }

    handleHide = () => this.setState({ active: false })

    handleItemClick = (e, { name }) => this.setState({ activeItem: name })

    handleShow = () => this.setState({ active: true })

    onChange = (value) => {
        this.setState({value})
        if(this.props.onChange) {
            this.props.onChange(value.toString('html'));
        }
    }

    showImage = () => this.setState({ show: true })

    render() {
        const { activeItem, authenticated, bearer, height, id, userId } = this.state
        const canEdit = this.props.createdBy ? this.props.createdBy.id === userId : false
        const FallacyMenu = props => (
            <div className='fallacyMainMenu'>
                <Menu 
                    pointing
                    secondary
                >
                    <Menu.Item
                        active={activeItem === 'conversation'} 
                        name='conversation' 
                        onClick={this.handleItemClick} 
                    />
                    <Menu.Item
                        active={activeItem === 'comments'}
                        name='comments'
                        onClick={this.handleItemClick}
                    >
                        Comments {props.commentCount > 0 ? `(${props.commentCount})` : ''}
                    </Menu.Item>
                    <Menu.Item
                        active={activeItem === 'reference'}
                        name='reference'
                        onClick={this.handleItemClick}
                    />
                </Menu>
            </div>
        )
        const FallacyTitle = ({props}) => {
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
                    canEdit={canEdit}
                    id={id}
                    subheader={subheader}
                    title={props.title}
                    type='fallacy'
                />
            )
        }
        const ShowContent = props => {
            switch(activeItem) {
                case'conversation':
                    return (
                        <div>
                            <div className='materialWrapper'> 
                                <FallacyExample 
                                    bearer={bearer} 
                                    canEdit={props.createdBy ? props.createdBy.id === userId : false}
                                    history={props.history}
                                    id={id}
                                />
                            </div>
                        </div>
                    )
                case'comments':
                    return (
                        <div className='commentsContent'>
                            <Comments 
                                authenticated={authenticated}
                                bearer={bearer}
                                history={this.props.history}
                                id={id} 
                            />
                        </div>
                    )
                case'reference':
                    return (
                        <div className='fallacyContent'>
                            <FallacyRef id={props.fallacyId} />
                        </div>
                    )
                default:
                    return null
            }
        }
        const ShowTags = props => {
            let tags = null
            if(props.tag_ids) {
                const tagIds = props.tag_ids.split(',')
                const tagNames = props.tag_names.split(',')
                Array.prototype.zip = function(arr) {
                    return this.map(function(e, i) {
                        return {id: e, name: arr[i]}
                    })
                }
                tags = tagIds.zip(tagNames)
            }

            return (
                <TagsCard 
                    bearer={bearer}
                    canEdit={canEdit}
                    id={id}
                    loading={tags ? false : true}
                    tags={tags ? tags : []}
                    type='fallacy'
                />
            )
        }

        return (
            <Provider store={store}>
                <div className='fallacyPage'>
                    <DisplayMetaTags page='fallacy' props={this.props} state={this.state} />
                        <PageHeader 
                            {...this.props}
                        />
                        <Container
                            className='mainContainer'
                            style={{ marginTop: '5em', minHeight: height +'px' }}
                            textAlign='left'
                        >
                            <FallacyTitle props={this.props} />
                            {FallacyMenu(this.props)}
                            <Grid>
                                <Grid.Column className='leftSide' width={12}>
                                    {ShowContent(this.props)}
                                    {activeItem === 'conversation' && (
                                        <Conversation  
                                            authenticated={authenticated}
                                            bearer={bearer}
                                            canRespond={this.props.canRespond}
                                            createdBy={this.props.createdBy}
                                            fallacyId={id}
                                            status={this.props.status}
                                            user={this.props.user}
                                        />
                                    )}
                                </Grid.Column>
                                <Grid.Column className='rightSide' width={4}>
                                    {ShowTags(this.props)}
                                </Grid.Column>
                            </Grid>
                        </Container>
                    <PageFooter />
                </div>
            </Provider>
        )
    }
}

Fallacy.propTypes = {
    canRespond: PropTypes.bool,
    commentCount: PropTypes.number,
    conversation: PropTypes.array,
    comments: PropTypes.shape({
        count: PropTypes.number,
        results: PropTypes.array
    }),
    createdAt: PropTypes.string,
    createdBy: PropTypes.shape({
        id: PropTypes.number,
        img: PropTypes.string,
        name: PropTypes.string,
        username: PropTypes.string
    }),
    error: PropTypes.bool,
    explanation: PropTypes.string,
    fallacies: PropTypes.array,
    fallacyId: PropTypes.number,
    fallacyName: PropTypes.string,
    fetchCommentCount: PropTypes.func,
    fetchFallacy: PropTypes.func,
    id: PropTypes.number,
    status: PropTypes.number,
    tag_ids: PropTypes.string,
    tag_names: PropTypes.string,
    title: PropTypes.string,
    tweet: PropTypes.object,
    video: PropTypes.object,
    user: PropTypes.shape({
        id: PropTypes.string,
        img: PropTypes.string,
        name: PropTypes.string,
        type: PropTypes.string,
        username: PropTypes.string
    }),
    viewCount: PropTypes.number
}

Fallacy.defaultProps = {
    canRespond: false,
    error: false,
    fetchCommentCount: fetchCommentCount,
    fetchFallacy: fetchFallacy
}

const mapStateToProps = (state, ownProps) => {
    return {
        ...state.fallacy,
        ...ownProps
    }
}

export default connect(mapStateToProps, { 
    fetchCommentCount,
    fetchFallacy, 
    updateFallacy 
})(Fallacy)