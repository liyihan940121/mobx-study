import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
// import App from './App';
import reportWebVitals from './reportWebVitals';
import { observable, action, autorun, computed, configure, runInAction, when, reaction} from 'mobx'
import { observer } from 'mobx-react';

// mobx的严格模式
//强制使用action修改数据状态
configure({ 
  enforceActions: true  //"observed"
});
// 1 初始化 mobx 容器仓库
// observable 把普通数据转换为可被观测的数据，才会被监测到，触发视图更新
class Store {
  @observable count = 0 
  @observable foo = 'word'
  @action.bound increment() {
    this.count ++ 
  }
  @observable price = 10 
  // 封装重复的逻辑
  // 缓存计算结果
  @computed get totalPrice () { //get 添加成员 
    return this.price * this.count
  }
  @action.bound change () {
    console.log(this)
    this.count = 10
    // this.foo = 'hello'
  }
  // 异步操作结束后修改数据状态
  @action.bound asyncChange () {
    setTimeout( () => {
      // this.count = 100
      // 1、额外定义action
      // this.changeCount()
      // 2、直接调用action
      // action('changeFoo', () => {
      //   this.foo = 'hello'
      // })()
      // 3、runInAction
      runInAction( () => {
        this.count = 100
      })
    },100)
  }
  @action.bound changeCount (value = 20) {
    this.count = value
  }
}
// 修改容器中的数据成员，也可以通过容器的实例去修改
const store = new Store()

// 会触发视图更新
// 根据依赖去执行一些观测后的行为处理，会默认执行一次;
// 接收一个函数作为参数
autorun(()=>{
  console.log(store.count)
})
runInAction(()=>{
  store.count = 20 
})

// 当count > 100 时，只执行一次自定义逻辑
when(
  ()=>{
    return store.conut >100
  },
  ()=>{
    console.log('when =>', store.conut)
  }
)
reaction(
  () => {
    //不同于autorun和when，只有当被观测的数据发生改变的时候，才会执行
    //执行一些业务逻辑操作，返回数据给下一个函数使用
    return store.count
  },
  (data, reaction) => {
    console.log(data)
    //手动停止当前 reaction 的监听
    reaction.dispose()
  }
)
store.changeCount(200)
store.changeCount(300) //不会再执行
// 不太合理，会频繁触发autorun
// store.count = 20 
// store.change()
const change = store.change
change()

store.asyncChange()


// 2 在组件中使用 mobx 容器状态
@observer
class App extends React.Component {
  render(){
    const { store } = this.props
    return (
      <div>
        <h1>App Component</h1>
        <p>{store.count}</p>
        <p><button onClick = {store.increment}>Increment</button></p>
        <p>总价：{store.price * store.count}</p>
        <p>总价2：{store.totalPrice}</p>
      </div>
    )
  }
}
// 3 在组件中发起 action 修改容器状态
//传递store对象,当做props,这样就可以在render函数中使用了
ReactDOM.render(
  <React.StrictMode>
    <App store={new Store()}/>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
