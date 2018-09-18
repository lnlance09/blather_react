import './style.css';
import { fetchDiscussions } from './actions';
import { adjustTimezone } from '../../../utils/dateFunctions';
import { connect } from 'react-redux';
import { 
    Button,
    Dropdown,
    Form,
    Icon,
    Image,
    Item,
    Message,
    Visibility
} from 'semantic-ui-react';
import _ from 'lodash';
import ImagePic from '../../../images/image-square.png';
import Moment from 'react-moment';
import ParagraphPic from '../../../images/short-paragraph.png';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ResultItem from '../../../components/item/v1/';

class DiscussionsList extends Component {
    constructor(props) {
        super(props)
        this.state = {
            id: null,
            loadingMore: false,
            page: 0,
            pages: props.pages,
            q: props.filter.q,
            results: props.results,
            startedOptions: [],
            startedBy: props.filter.startedBy,
            status: props.filter.status,
            statusOptions: [
                {key: 'pending', text: 'Pending', value: 1},
                {key: 'active', text: 'Active', value: 2},
                {key: 'changed_min', text: 'Convinced', value: 3}
            ],
            tagsOptions: [],
            tags: [],
            with: this.props.filter.with,
            withOptions: []
        }

        this.handleAddition = this.handleAddition.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.onChangeSearchTerm = this.onChangeSearchTerm.bind(this)
        this.onSelectStartedBy = this.onSelectStartedBy.bind(this)
        this.onSelectStatus = this.onSelectStatus.bind(this)
        this.onSelectWith = this.onSelectWith.bind(this)
        this.onSubmitForm = this.onSubmitForm.bind(this)
        this.loadMore = _.debounce(this.loadMore.bind(this), 500)
    }

    componentDidMount() {
        this.props.fetchDiscussions({
            bearer: this.props.bearer,
            startedBy: this.props.filter.startedBy
        })
        this.fetchTags()
        this.fetchUsers()
    }

    componentWillReceiveProps() {
        this.setState({ loadingMore: false })
    }

    fetchTags() {
        return fetch(`${window.location.origin}/api/discussions/getTags`, {
            headers:{
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if(response.ok) {
                response.json().then(data => {
                    this.setState({ tagsOptions: data.tags })
                })
            }
        }).catch(err => console.log(err))
    }

    fetchUsers() {
        const img = this.props.userImages ? 1 : 0
        return fetch(`${window.location.origin}/api/discussions/getUsers?both=true&img=${img}`, {
            headers:{
                'Content-Type': 'application/json'
            }
        }).then(response => {
            if(response.ok) {
                response.json().then(data => {
                    this.setState({ 
                        startedOptions: data.users, 
                        withOptions: data.users 
                    })
                })
            }
        }).catch(err => console.log(err))
    }

    handleAddition = (e, { value }) => this.setState({ tagsOptions: [{ text: value, value }, ...this.state.tagsOptions] })

    handleChange = (e, { value }) => this.setState({ tags: value })

    loadMore = () => {
        if(this.state.page < (this.props.pages-1)) {
            const newPage = parseInt(this.state.page+1, 10)
            this.setState({ 
                loadingMore: true,
                page: newPage 
            })
            this.props.fetchDiscussions({
                bearer: this.state.bearer,
                page: newPage,
                q: this.state.q,
                startedBy: this.state.startedBy,
                tags: this.state.tags,
                withUser: this.state.with
            })
        }
    }

    onChangeSearchTerm = (e, { value }) => this.setState({ q: value })

    onSelectStartedBy = (e, { value }) => this.setState({ startedBy: value })

    onSelectStatus = (e, { value }) => this.setState({ status: value })

    onSelectWith = (e, { value }) => this.setState({ with: value })

    onSubmitForm() {
        this.setState({ page: 0 })
        this.props.fetchDiscussions({
            bearer: this.state.bearer,
            page: 0,
            q: this.state.q,
            startedBy: this.state.startedBy,
            tags: this.state.tags,
            withUser: this.state.with
        })
    }

    render() {
        const { loadingMore, q, startedOptions, statusOptions, tags, tagsOptions, withOptions } = this.state
        const advancedOptions = props => (
            <div className='advancedOptions'>
                <Form.Group>
                    <Form.Field width={11}>
                        <Dropdown
                            closeOnChange
                            fluid
                            multiple
                            onAddItem={this.handleAddition}
                            onChange={this.handleChange}
                            options={tagsOptions}
                            placeholder='Tags'
                            search
                            selection
                            value={tags}
                        />
                    </Form.Field>
                    <Form.Field width={4}>
                        <Button 
                            className='searchDiscussionsBtn'
                            content='Search'
                            fluid 
                            type='submit'
                        />
                    </Form.Field>
                    <Form.Field width={1}>
                        <Button 
                            className='createDiscussionBtn'
                            compact
                            icon
                            onClick={() => props.history.push('/discussion/create')}
                            style={{ float: 'right' }}
                        >
                            <Icon name='plus'/>
                        </Button>
                    </Form.Field>
                </Form.Group>
            </div>
        )
        const FilterSection = props => (
            <div className='discussionsFilter'>
                <Form onSubmit={this.onSubmitForm}>
                    <Form.Group>
                        <Form.Input 
                            fluid 
                            icon='search' 
                            iconPosition='left'
                            onChange={this.onChangeSearchTerm}
                            placeholder='Search discussions...' 
                            value={q}
                            width={props.onUserPage ? 7 : 16}
                        />
                    </Form.Group>
                    <Form.Group>
                        {!props.onUserPage && (
                            <Form.Field width={7}>
                                <Dropdown 
                                    fluid
                                    onChange={this.onSelectStartedBy}
                                    options={startedOptions}
                                    placeholder='Started by'
                                    selection
                                />
                            </Form.Field>
                        )}
                        <Form.Field width={props.onUserPage ? 6 : 7}>
                            <Dropdown 
                                fluid
                                onChange={this.onSelectWith}
                                options={withOptions}
                                placeholder='With'
                                selection
                            />
                        </Form.Field>
                        <Form.Field width={props.onUserPage ? 3 : 4}>
                            <Dropdown 
                                fluid
                                onChange={this.onSelectStatus}
                                options={statusOptions}
                                placeholder='Status'
                                selection
                            />
                        </Form.Field>
                    </Form.Group>
                    {advancedOptions(this.props)}
                </Form>
            </div>
        )
        const renderDiscussions = props => {
            return props.results.map((result, i) => {
                if(result.discussion_id) {
                    let meta = (
                        <div>
                            Created by {result.creator_user_name} <Moment date={adjustTimezone(result.discussion_date)} fromNow /> 
                        </div>
                    )
                    return (
                        <ResultItem 
                            description={result.description}
                            history={this.props.history}
                            id={`discussion_${i}`}
                            img={result.creator_img ? result.creator_img : result.acceptor_img}
                            key={`discussion_${i}`}
                            meta={meta}
                            sanitize
                            tags={result.tags ? result.tags.split(',') : null}
                            title={result.title}
                            type='discussion'
                            url={`/discussions/${result.discussion_id}`}
                        />
                    )
                } else {
                    return (
                        <Item key={`discussion_${i}`}>
                            <Item.Image size='small' src={ImagePic} />
                            <Item.Content>
                                <Image fluid src={ParagraphPic} />
                            </Item.Content>
                        </Item>
                    )
                }
            })
        }
        const lazyLoadSegments = (props) => {
            if(loadingMore && props.page < parseInt(props.pages-1, 10)) {
                const faker = [{},{},{},{},{}]
                return faker.map((result, i) => (
                    <Item key={`discussion_${i}`}>
                        <Item.Image size='small' src={ImagePic} />
                        <Item.Content>
                            <Image fluid src={ParagraphPic} />
                        </Item.Content>
                    </Item>
                ))
            }
        }

        return (
            <div className='discussionsList'>
                {this.props.includeFilter && (
                    <div>
                        {FilterSection(this.props)}
                    </div>
                )}
                {this.props.results.length > 0 && (
                    <Visibility 
                        continuous
                        onBottomVisible={this.loadMore} 
                        style={{ marginTop: '14px' }}
                    >
                        <Item.Group className='discussionItems' divided>
                            {renderDiscussions(this.props)}
                            {lazyLoadSegments(this.props)}
                        </Item.Group>
                    </Visibility>
                )}

                {this.props.results.length === 0 && (
                    <div className='emptyDiscussionContainer'>
                        <Message
                            content='Try modifying your search...'
                            header='No results'
                        />
                    </div>
                )}
            </div>
        )
    }
}

DiscussionsList.propTypes = {
    count: PropTypes.number,
    fetchDiscussions: PropTypes.func,
    filter: PropTypes.shape({
        q: PropTypes.string,
        startedBy: PropTypes.number,
        status: PropTypes.array,
        tags: PropTypes.array,
        with: PropTypes.number
    }),
    hasMore: PropTypes.bool,
    includeFilter: PropTypes.bool,
    loadingMore: PropTypes.bool,
    noResultsMsg: PropTypes.string,
    onUserPage: PropTypes.bool,
    page: PropTypes.number,
    pages: PropTypes.number,
    results: PropTypes.array,
    userId: PropTypes.number,
    userImages: PropTypes.bool
}

DiscussionsList.defaultProps = {
    fetchDiscussions: fetchDiscussions,
    filter: {},
    includeFilter: false,
    onUserPage: false,
    results: [{},{},{},{},{},{},{},{},{},{}],
    userImages: true
}

const mapStateToProps = (state, ownProps) => ({
    ...state.discussions,
    ...ownProps
})

export default connect(mapStateToProps, { fetchDiscussions })(DiscussionsList)