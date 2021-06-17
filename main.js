import { APIWrapper, API_EVENT_TYPE } from "./api.js";
import { addMessage,
      animateGift,
      isPossiblyAnimatingGift,
      isAnimatingGiftUI } from "./dom_updates.js";

const api = new APIWrapper();



class Queue {
  constructor() {
    this.ListQueue = []
    this.ShownIdList = []
    this.CurrentEvent = null
  }

  SortList(list) {
    const sortedList = [...list]
    sortedList.sort(function (a, b) {
      if (a.type === API_EVENT_TYPE.ANIMATED_GIFT) return -1
      else return 1
    })
    return sortedList
  }

 
  Process() {
    this.Remove(this.CurrentEvent)

    this.CurrentEvent = this.ListQueue.find((event) => {
      if (event.type !== API_EVENT_TYPE.ANIMATED_GIFT) return true
      else if (!isPossiblyAnimatingGift() && !isAnimatingGiftUI()) return true
      else return false
    })
      if (!this.CurrentEvent) return
    addMessage(this.CurrentEvent)
    this.CurrentEvent.type === API_EVENT_TYPE.ANIMATED_GIFT && animateGift(this.CurrentEvent)
    this.ShownIdList.push(this.CurrentEvent.id)
  }


  Begin(newList = []) {
    const sortedList = this.SortList(newList)
    this.ListQueue = [...this.ListQueue, ...sortedList]

    setInterval(() => {

      this.ListQueue = this.ListQueue.filter(
	  item => !this.ShownIdList.some(id => id === item.id) ||
	  (item.type === API_EVENT_TYPE.MESSAGE && new Date() - item.timestamp < 5000)
	  );
	  
      this.Process()
    }, 500);
  }

 

  Remove(item) {
    if (!item) return
    this.ListQueue.splice(this.ListQueue.findIndex(item => item.id === item.id), 1);
  }
}

const defaultQueue = new Queue()

api.setEventHandler((events) => {
  defaultQueue.Begin(events)
})
