import { createSlice } from "@reduxjs/toolkit";

const savedUser = JSON.parse(localStorage.getItem("user")) || null;

const authSlice = createSlice({
  name: "auth",
  initialState: {
    user: savedUser,
    token: savedUser ? "is-logged-in" : null, //  Dùng giả lập để UI không bị break nếu check token
  },
  reducers: {
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = "is-logged-in";
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      // localStorage.setItem("token", action.payload.token); //  Bỏ lưu token vào localStorage
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      localStorage.removeItem("user");
      // localStorage.removeItem("token"); //  Bỏ xóa token khỏi localStorage
    },
    updateUser: (state, action) => {
      state.user = {
        ...state.user,
        ...action.payload,
      };
      localStorage.setItem("user", JSON.stringify(state.user));
    },
  },
});

export const { loginSuccess, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
