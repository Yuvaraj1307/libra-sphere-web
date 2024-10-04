import { deleteAPI, getAPI, postAPI, putAPI } from "./api"

const USERS = '/users';
const BOOKS = '/books';
const TRANSACTION = '/transaction';
const AUTH = '/auth';
const LOGIN = `${AUTH}/login`;
const LIBRARIES = '/libraries';
const BORROW_REQUESTS = '/borrow-requests';
const BORROWED_BOOKS = '/borrowed-books';
const DASHBOARD = '/dashboard';
const USER_INFO = '/user-info';

export const handleLogin = async (params = {}) => await postAPI(LOGIN, params);

export const getAllUsers = async (params = {}) => await getAPI(USERS, params);
export const createUser = async (params = {}) => await postAPI(USERS, params);
export const updateUser = async (params = {}) => await putAPI(USERS, params);
export const deleteUser = async (id) => await deleteAPI(`${USERS}/${id}`);

export const getAllBooks = async (params = {}) => await getAPI(BOOKS, params);
export const createBook = async (params = {}) => await postAPI(BOOKS, params);
export const updateBook = async (params = {}) => await putAPI(BOOKS, params);
export const deleteBook = async (book_uid) => await deleteAPI(`${BOOKS}/${book_uid}`);
export const getApprovedBooks = async (params = {}) => await getAPI(`${BOOKS}/approved`, params);

export const getAllTransactions = async (params = {}) => await getAPI(TRANSACTION, params);
export const createTransaction = async (params = {}) => await postAPI(TRANSACTION, params);
export const updateTransaction = async (params = {}) => await putAPI(TRANSACTION, params);
export const deleteTransaction = async (transaction_uid) => await deleteAPI(TRANSACTION, { transaction_uid });


export const getLibraries = async (params = {}) => await getAPI(LIBRARIES, params)
export const createLibrary = async (params = {}) => await postAPI(LIBRARIES, params);
export const updateLibrary = async (params = {}) => await putAPI(LIBRARIES, params);
export const deleteLibrary = async (id) => await deleteAPI(`${LIBRARIES}/${id}`);

export const getBarrowRequests = async (params = {}) => await getAPI(BORROW_REQUESTS, params);
export const createBarrowRequests = async (params = {}) => await postAPI(BORROW_REQUESTS, params);
export const updateBarrowRequests = async (params = {}) => await putAPI(BORROW_REQUESTS, params);
export const deleteBarrowRequests = async (id) => await deleteAPI(`${BORROW_REQUESTS}/${id}`)

export const getBarrowedBooks = async (params = {}) => await getAPI(BORROWED_BOOKS, params);
export const createBarrowedBooks = async (params = {}) => await postAPI(BORROWED_BOOKS, params);
export const updateBarrowedBooks = async (params = {}) => await putAPI(BORROWED_BOOKS, params);
export const deleteBarrowedBooks = async (id) => await deleteAPI(`${BORROWED_BOOKS}/${id}`)

export const getUserDashboard = async () => await getAPI(DASHBOARD);
export const getUserInfo = async (params = {}) => await getAPI(USER_INFO, params);
