import './style.css';
import { selectAssignee } from '../../fallacyForm/v1/actions';
import { connect, Provider } from 'react-redux';
import { 
    Form,
    Header,
    Icon,
    Image,
    Search
} from 'semantic-ui-react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import store from '../../../store';

class NavSearch extends Component {
    constructor(props) {
        super(props)
        this.state = {
            isLoading: false, 
            results: [], 
            value: props.defaultValue ? props.defaultValue : ''
        }
        this.onClick = this.onClick.bind(this)
    }

    componentWillMount() {
        this.resetComponent()
    }

    fetchResults() {
        return fetch(`${window.location.origin}/api/search/basic?q=${this.state.value}`, {
            json: true
        }).then(response => {
            if(response.ok) {
                response.json().then(data => {
                    this.setState({ 
                        isLoading: false,
                        results: data.results 
                    })
                })
            }
        }).catch(err => console.log(err))
    }

    handleSearchChange = (e, { value }) => {
        this.setState({ isLoading: value.length > 3, value })
        this.fetchResults()
    }

    handleSubmit = e => {
        e.preventDefault()
        this.props.history.push(`/search?q=${this.state.value}`)
    }

    onClick = (e, data) => {
        const link = data.result.type === 'youtube' ? data.result.social_media_id : data.result.username
        if(this.props.source === 'header') {
            this.props.history.push(`/pages/${data.result.type}/${link}`)
        }

        if(this.props.source === 'fallacyForm') {
            this.props.selectAssignee({
                id: data.result.social_media_id,
                name: data.result.title,
                type: data.result.type,
                username: data.result.username
            })
            this.setState({ value: data.result.title })
        }
    }

    resetComponent = () => this.setState({ 
        isLoading: false, 
        results: [], 
        value: this.props.defaultValue ? this.props.defaultValue : ''
    })

    render() {
        const { isLoading, results, value } = this.state
        const resultRenderer = ({ description, image, key, social_media_id, title, type, username }) => {
            return (
                <div className='searchItem' key={key}>
                    <Image
                        className='dropDownItemPic'
                        rounded={false}
                        src={image} 
                    /> 
                    <Header size='tiny'>{title}</Header>
                    <span><Icon className={`${type}Icon`} name={type} /></span>
                </div>
            );
        }

        resultRenderer.propTypes = {
            description: PropTypes.string,
            image: PropTypes.string,
            key: PropTypes.string,
            social_media_id: PropTypes.string,
            title: PropTypes.string,
            type: PropTypes.string,
            username: PropTypes.string
        }

        const SearchBar = props => (
            <Search
                className='navSearch'
                defaultValue={value}
                loading={isLoading}
                minCharacters={4}
                onResultSelect={this.onClick}
                onSearchChange={_.debounce(this.handleSearchChange, 500, { leading: true })}
                placeholder={props.placeholder}
                results={results}
                resultRenderer={resultRenderer}
                selectFirstResult
            />
        )

        return (
            <Provider store={store}>
                <div style={{ width: `${this.props.width}` }}>
                    {this.props.source === 'header' && (
                        <Form onSubmit={this.handleSubmit}>
                            {SearchBar(this.props)}
                        </Form>
                    )}
                    {this.props.source === 'fallacyForm' && (
                        <div>
                            {SearchBar(this.props)}
                        </div>
                    )}
                </div>
            </Provider>
        )
    }
}

NavSearch.propTypes = {
    defaultValue: PropTypes.string,
    placeholder: PropTypes.string,
    selectAssignee: PropTypes.func,
    source: PropTypes.string,
    width: PropTypes.string
}

NavSearch.defaultProps = {
    placeholder: 'Search pages',
    selectAssignee: selectAssignee,
    source: 'header',
    width: '360px'
}

const mapStateToProps = (state, ownProps) => ({
    ...state.fallacyForm,
    ...ownProps
})

export default connect(mapStateToProps, { selectAssignee })(NavSearch)