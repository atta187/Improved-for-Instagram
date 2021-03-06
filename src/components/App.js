import About from './About'
import Liked from './Liked'
import Nav from './Nav'
import Options from './Options'
import Saved from './Saved'
import bind from 'autobind-decorator'
import { Component, createElement } from 'nervjs'
import { HashRouter, Route } from './HashRouter'

export default class App extends Component {
	state = {
		location: window.location.hash.replace('#/', ''),
	}

	@bind
	handleLocationChanged(childKey, params, cb) {
		this.setState(prevState => ({ location: childKey }))
		cb()
	}

	shouldComponentUpdate(nextProps, nextState) {
		return nextState.location !== this.state.location
	}

	render() {
		return (
			<div id="app">
				<Nav location={this.state.location} />

				<main className="d-flex justify-content-center">
					<HashRouter onLocationChanged={this.handleLocationChanged}>
						<Route key="liked" hash="#/">
							{Liked}
						</Route>
						<Route key="saved" hash="#/saved">
							{Saved}
						</Route>
						<Route key="options" hash="#/options">
							<Options />
						</Route>
						<Route key="about" hash="#/about">
							<About />
						</Route>
					</HashRouter>
				</main>
				<a href="#" id="backToTop">
					<i className="material-icons">keyboard_arrow_up</i>
				</a>
			</div>
		)
	}
}
