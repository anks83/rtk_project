import { useSelector, useDispatch } from 'react-redux';
import { increment, decrement, reset, increasedByAmount } from './counterSlice';

const Counter = () => {
    const count = useSelector((state) => state.counter.counter);
    const dispatch = useDispatch();
  return (
    <section>
      <h1>Counter: {count}</h1>
      <button onClick={() => dispatch(increment())}>Increment</button>
      <button onClick={() => dispatch(decrement())}>Decrement</button>
      <button onClick={() => dispatch(reset())}>Reset</button>
      <button onClick={() => dispatch(increasedByAmount(5))}>Increase by 5</button>
    </section>
  ) 
}

export default Counter