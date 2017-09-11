const INITIAL_STATE = {
  id: Math.random().toString(36).slice(2)
};

export default function(state = INITIAL_STATE, action) {
  return state;
}
