import React, {Component, Fragment} from 'react'
import Card from './Card'

class Deck extends Component {
    constructor(props) {
        super(props)
        this.state = {
            cards: [],
            numberOfCardsByIndex: 2
        }
    }

    componentDidMount() {
        const newCards = []
        for (let i = 0; i<=this.state.numberOfCardsByIndex; i++) {
            newCards.push(
                <Card picsum={`https://picsum.photos/600/${350+i}`} key={i} myid={this.props.myid}/>
            )
        }

        this.setState({cards: newCards}, () => {
            
            let imgWidthAsPercentage = 50
            // imgWidthAsPercentage = window.innderWidth < 768 ? 100 : imgWidthAsPercentage
            
            this.newWidth = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ?
            (imgWidthAsPercentage / 100) * window.screen.width :
            (imgWidthAsPercentage / 100) * window.innerWidth 

            this.viewPort.style.width = `${this.newWidth}px`
            window.addEventListener('resize', () => {
                let imgWidthAsPercentage = 50
                
            // imgWidthAsPercentage = window.innderWidth < 768 ? 100 : imgWidthAsPercentage
            
            this.newWidth = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ?
            (imgWidthAsPercentage / 100) * window.screen.width :
            (imgWidthAsPercentage / 100) * window.innerWidth 

            this.viewPort.style.width = `${this.newWidth}px`

            this.orderCards()

            this.rightBoundary = parseFloat(this.images.children[this.state.numberOfCardsByIndex].style.left) + this.newWidth
            this.leftBoundary = parseFloat(this.images.children[0].style.left) - this.newWidth

            for (let i = 0; i < this.images.children.length; i++) {
                this.lastPositions[i] = parseFloat(this.images.children[i].style.left)
            }
            })

            this.orderCards()

            this.startTouchPosition = 0.0
            this.updatedPosition = 0.0
            this.speedModifier = 0.8
            this.lastPositions = []
            this.rightBoundary = parseFloat(this.images.children[this.state.numberOfCardsByIndex].style.left) + this.newWidth
            this.leftBoundary = parseFloat(this.images.children[0].style.left) - this.newWidth

            for (let i = 0; i < this.images.children.length; i++) {
                this.lastPositions.push(parseFloat(this.images.children[i].style.left))
            }

            this.touchArea.addEventListener('touchstart', this.handleTouchStart, {passive: false})
            this.touchArea.addEventListener('touchmove', this.handleTouchMove, {passive: false})
            this.touchArea.addEventListener('touchend', this.handleTouchStart, {passive: false})
        
            this.scrollInProgress = false;

            this.snapInProgress = false;
            this.distanceToScroll = 0.0
            this.seed = 0.0
            this.snapSpeedModifier = 0.5
        })
    }

    orderCards = () => {
        const cardWidth = parseFloat(styles.viewPort.width),
        middleCardByIndex = Math.floor(this.state.numberOfCardsByIndex/2)
        let counterForRight = 1,
        counterForLeft = middleCardByIndex

        for(let i=0; i < this.images.children.length; i++) {
            this.images.children[i].style.transitionDuration = '0.0s'
            if (i < middleCardByIndex) {
                this.images.children[i].style.left = `-${(counterForLeft * this.newWidth) - (this.newWidth / 2)}px`
                counterForLeft--
            } else if (i > middleCardByIndex) {
                this.images.children[i].style.left = `${(counterForRight * this.newWidth) + (this.newWidth / 2)}px`
                counterForRight++
            } else {
                this.images.children[i].style.right = `${(this.newWidth / 2)}px`

            }
        }
    }

    handleBoundaries = () => {
        if (this.lastPositions[this.state.numberOfCardsByIndex] >= this.rightBoundary) {
            const beginningOfDeck = this.lastPositions[0] - this.newWidth
            this.images.children[this.state.numberOfCardsByIndex].style.left = `${beginningOfDeck}px`
            this.lastPositions[this.state.numberOfCardsByIndex] = beginningOfDeck

            this.images.insertBefore(this.images.children[this.state.numberOfCardsByIndex], this.images.children[0])
            this.lastPositions.splice(0,0, this.lastPositions.pop())
        }
        if (this.lastPositions[0] <= this.leftBoundary) {
            const endOfDeck = this.lastPositions[this.state.numberOfCardsByIndex] + this.newWidth
            this.images.children[0].style.left = `${endOfDeck}px`
            this.lastPositions[0] = endOfDeck

            this.images.appendChild(this.images.children[0], this.images.children[this.state.numberOfCardsByIndex])
            this.lastPositions.splice(this.state.numberOfCardsByIndex, 0, this.lastPositions.shift())
        }
    }

    snapBack = () => {
        this.snapInProgress = true

        const adjusedPositions = this.lastPositions.map(pos => Math.abs(pos - (this.newWidth/2)))
        const closestCardByIndex = adjusedPositions.indexOf(Math.min(...adjusedPositions))

        this.distanceToScroll = adjusedPositions[closestCardByIndex] *
        (this.lastPositions[closestCardByIndex] > (this.newWidth/2) ? -1.0 : 1.0)
        this.animateSnap()
    }

    animateSnap = () => {
        
    }

    handleTouchStart = event => {
        if(this.snapInProgress) return
        this.startTouchPosition = event.changedTouches[0].screenX

        for (let i = 0; i < this.images.children.length; i++) {
            this.images.children[i].style.transitionDuration = '0.0s'
        }        
    }

    handleTouchMove = event => {
        event.preventDefault()
        if(this.snapInProgress) return

        const currentTouchPosition = event.changedTouches[0].screenX
        let difference = currentTouchPosition - this.startTouchPosition
        difference *= this.speedModifier

        this.startTouchPosition = currentTouchPosition

        for (let i = 0; i < this.images.children.length; i++) {
            this.updatedPosition = this.lastPositions[i] + difference
            this.images.children[i].style.left = `${this.updatedPosition}px`
            this.lastPositions[i] = this.updatedPosition
        }  

        this.handleBoundaries()
    }

    handleTouchEnd = event => {
        if(this.snapInProgress) return
        this.snapBack()
    }

    handlePrev = () => {
        if (this.scrollInProgress || this.snapInProgress) return
        this.scrollInProgress = true
        for (let i = 0; i < this.images.children.length; i++) {
            this.updatedPosition = this.lastPositions[i] + this.newWidth
            this.images.children[i].style.transitionDuration = '1s'
            this.images.children[i].style.left = `${this.updatedPosition}px`
            this.lastPositions[i] = this.updatedPosition
        }  

        this.handleBoundaries()

        setTimeout(() => {
            this.scrollInProgress = false
        }, 1000);
    }

    handleNext = () => {
        if (this.scrollInProgress || this.snapInProgress) return
        this.scrollInProgress = true
        for (let i = 0; i < this.images.children.length; i++) {
            this.updatedPosition = this.lastPositions[i] - this.newWidth
            this.images.children[i].style.transitionDuration = '1s'
            this.images.children[i].style.left = `${this.updatedPosition}px`
            this.lastPositions[i] = this.updatedPosition
        }  

        this.handleBoundaries()

        setTimeout(() => {
            this.scrollInProgress = false
        }, 1000);
    }

    render() {
        return(
            <Fragment>
                <button onClick={this.handlePrev} id="prev">Prev
                    </button>
                <button onClick={this.handleNext} id="next">Next
                </button>
                <div ref={refId=> this.touchArea = refId} style={styles.touchArea} className="touchArea">

                </div>
                <div ref={refId=> this.viewPort = refId} style={styles.viewPort} className="viewPort">
                    <div ref={refId=> this.images = refId} style={styles.imagesContainer} className="imagesContainer">
                        {this.state.cards}
                    </div>
                </div>
            </Fragment>
        )
    }
}

const styles = {
    viewPort: {
        margin: 0,
        padding: 0,
        width: '500px',
        height: '300px',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        overflow: 'hidden'
    },
    imagesContainer: {
        margin: 0,
        padding: 0,
        width: 'inherit',
        height: 'inherit',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
    },
    touchArea: {
        margin: 0,
        padding: 0,
        width: '100vw',
        height: '300px',
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(255, 0, 0, 0.2)',
        zIndex: 9999
    }
}

export default Deck