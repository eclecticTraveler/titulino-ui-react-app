import React, {Component} from 'react'
import { Card } from 'antd';

class PhraseOfTheDay extends Component {
    componentDidMount() {

	}

	componentDidUpdate() {

	}

	render(){ 
		return (
			<div>			
				<Card
					actions={[																				
						<span onClick={() => alert(true)}>LISTEN</span>,
						]}>
					<h2>Phrase of the Day</h2>
					<Card>
						<div>Que piensas sobre ...</div>  
						<h3>What do you think about ... ?</h3>
						<br />
						<span>Dios</span>
						<h3>a.- God </h3>
						<span>las familias</span>
						<h3>b.- families </h3>
						<h3>c.- prophets </h3>
					</Card>
				</Card>
			</div>
		)
    }
}

export default PhraseOfTheDay;
