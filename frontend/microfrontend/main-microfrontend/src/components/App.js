import React, { lazy, Suspense, useState, useEffect }  from "react";
import { Route, useHistory, Switch } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import PopupWithForm from "./PopupWithForm";
import api from "../utils/api";
import { CurrentUserContext } from "../contexts/CurrentUserContext";
import ProtectedRoute from "./ProtectedRoute";
import * as auth from "../utils/auth.js";




// загрузка компонента Register из микрофронтенда auth-microfrontend
const InfoTooltip = lazy(() => import('auth-microfrontend/InfoTooltip').catch(() => {
  return { default: () => <div className='error'>Component is not available!</div> };
 })
 );


// загрузка компонента Register из микрофронтенда auth-microfrontend
const Register = lazy(() => import('auth-microfrontend/Register').catch(() => {
  return { default: () => <div className='error'>Component is not available!</div> };
 })
 );

 // загрузка компонента Login из микрофронтенда auth-microfrontend
const Login = lazy(() => import('auth-microfrontend/Login').catch(() => {
  return { default: () => <div className='error'>Component is not available!</div> };
 })
 );

 // загрузка компонента EditAvatarPopup из микрофронтенда profile-microfrontend
const  EditAvatarPopup = lazy(() => import('profile-microfrontend/EditAvatarPopup').catch(() => {
  return { default: () => <div className='error'>Component is not available!</div> };
 })
 );

 // загрузка компонента EditProfilePopup из микрофронтенда profile-microfrontend
const EditProfilePopup = lazy(() => import('profile-microfrontend/EditProfilePopup').catch(() => {
  return { default: () => <div className='error'>Component is not available!</div> };
 })
 );

  // загрузка компонента ShowProfile из микрофронтенда profile-microfrontend 
const ShowProfile = lazy(() => import('profile-microfrontend/ShowProfile').catch(() => {
  return { default: () => <div className='error'>Component is not available!</div> };
 })
 );

 // загрузка компонента AddPlacePopup из микрофронтенда cards-microfrontend
const AddPlacePopup = lazy(() => import('cards-microfrontend/AddPlacePopup').catch(() => {
  return { default: () => <div className='error'>Component is not available!</div> };
 })
 );

// загрузка компонента Card из микрофронтенда cards-microfrontend
const Card = lazy(() => import('cards-microfrontend/Card').catch(() => {
  return { default: () => <div className='error'>Component is not available!</div> };
 })
 );

// загрузка компонента ImagePopup из микрофронтенда cards-microfrontend
 const ImagePopup = lazy(() => import('cards-microfrontend/ImagePopup').catch(() => {
  return { default: () => <div className='error'>Component is not available!</div> };
 })
 );

 // загрузка компонента MainCards из микрофронтенда cards-microfrontend
const MainCards = lazy(() => import('cards-microfrontend/MainCards').catch(() => {
  return { default: () => <div className='error'>Component is not available!</div> };
 })
 ); 


function App() {
  const [isEditProfilePopupOpen, setIsEditProfilePopupOpen] =
    React.useState(false);
  const [isAddPlacePopupOpen, setIsAddPlacePopupOpen] = React.useState(false);
  const [isEditAvatarPopupOpen, setIsEditAvatarPopupOpen] =
    React.useState(false);
  const [selectedCard, setSelectedCard] = React.useState(null);
  const [cards, setCards] = React.useState([]);

  // В корневом компоненте App создана стейт-переменная currentUser. Она используется в качестве значения для провайдера контекста.
  const [currentUser, setCurrentUser] = React.useState({});

  const [isInfoToolTipOpen, setIsInfoToolTipOpen] = React.useState(false);
  const [tooltipStatus, setTooltipStatus] = React.useState("");

  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  //В компоненты добавлены новые стейт-переменные: email — в компонент App
  const [email, setEmail] = React.useState("");

  const history = useHistory();

  // Запрос к API за информацией о пользователе и массиве карточек выполняется единожды, при монтировании.
  React.useEffect(() => {
    api
      .getAppInfo()
      .then(([cardData, userData]) => {
        setCurrentUser(userData);
        setCards(cardData);
      })
      .catch((err) => console.log(err));
  }, []);

  // при монтировании App описан эффект, проверяющий наличие токена и его валидности
  React.useEffect(() => {
    const token = localStorage.getItem("jwt");
    if (token) {
      auth
        .checkToken(token)
        .then((res) => {
          setEmail(res.data.email);
          setIsLoggedIn(true);
          history.push("/");
        })
        .catch((err) => {
          localStorage.removeItem("jwt");
          console.log(err);
        });
    }
  }, [history]);

  function handleEditProfileClick() {
    setIsEditProfilePopupOpen(true);
  }

  function handleAddPlaceClick() {
    setIsAddPlacePopupOpen(true);
  }

  function handleEditAvatarClick() {
    setIsEditAvatarPopupOpen(true);
  }

  function closeAllPopups() {
    setIsEditProfilePopupOpen(false);
    setIsAddPlacePopupOpen(false);
    setIsEditAvatarPopupOpen(false);
    setIsInfoToolTipOpen(false);
    setSelectedCard(null);
  }

  function handleCardClick(card) {
    setSelectedCard(card);
  }

  function handleUpdateUser(userUpdate) {
    api
      .setUserInfo(userUpdate)
      .then((newUserData) => {
        setCurrentUser(newUserData);
        closeAllPopups();
      })
      .catch((err) => console.log(err));
  }

  function handleUpdateAvatar(avatarUpdate) {
    api
      .setUserAvatar(avatarUpdate)
      .then((newUserData) => {
        setCurrentUser(newUserData);
        closeAllPopups();
      })
      .catch((err) => console.log(err));
  }

  function handleCardLike(card) {
    const isLiked = card.likes.some((i) => i._id === currentUser._id);
    api
      .changeLikeCardStatus(card._id, !isLiked)
      .then((newCard) => {
        setCards((cards) =>
          cards.map((c) => (c._id === card._id ? newCard : c))
        );
      })
      .catch((err) => console.log(err));
  }

  function handleCardDelete(card) {
    api
      .removeCard(card._id)
      .then(() => {
        setCards((cards) => cards.filter((c) => c._id !== card._id));
      })
      .catch((err) => console.log(err));
  }

  function handleAddPlaceSubmit(newCard) {
    api
      .addCard(newCard)
      .then((newCardFull) => {
        setCards([newCardFull, ...cards]);
        closeAllPopups();
      })
      .catch((err) => console.log(err));
  }

  function onRegister({ email, password }) {
    auth
      .register(email, password)
      .then((res) => {
        setTooltipStatus("success");
        setIsInfoToolTipOpen(true);
        history.push("/signin");
      })
      .catch((err) => {
        setTooltipStatus("fail");
        setIsInfoToolTipOpen(true);
      });
  }

  function onLogin({ email, password }) {
    auth
      .login(email, password)
      .then((res) => {
        setIsLoggedIn(true);
        setEmail(email);
        history.push("/");
      })
      .catch((err) => {
        setTooltipStatus("fail");
        setIsInfoToolTipOpen(true);
      });
  }

  function onSignOut() {
    // при вызове обработчика onSignOut происходит удаление jwt
    localStorage.removeItem("jwt");
    setIsLoggedIn(false);
    // После успешного вызова обработчика onSignOut происходит редирект на /signin
    history.push("/signin");
  }

  return (
    // В компонент App внедрён контекст через CurrentUserContext.Provider
    <CurrentUserContext.Provider value={currentUser}>
      <div className="page__content">
        <Header email={email} onSignOut={onSignOut} />
        <Switch>
          {/*Роут / защищён HOC-компонентом ProtectedRoute*/}
          <ProtectedRoute
            exact
            path="/"
            component={Main}
            cards={cards}
            onEditProfile={handleEditProfileClick}
            onAddPlace={handleAddPlaceClick}
            onEditAvatar={handleEditAvatarClick}
            onCardClick={handleCardClick}
            onCardLike={handleCardLike}
            onCardDelete={handleCardDelete}
            loggedIn={isLoggedIn}
          />
          {/*Роут /signup и /signin не является защищёнными, т.е оборачивать их в HOC ProtectedRoute не нужно.*/}
          <Route path="/signup">
            <Register onRegister={onRegister} />
          </Route>
          <Route path="/signin">
            <Login onLogin={onLogin} />
          </Route>
        </Switch>
        <Footer />
        <EditProfilePopup
          isOpen={isEditProfilePopupOpen}
          onUpdateUser={handleUpdateUser}
          onClose={closeAllPopups}
        />
        <AddPlacePopup
          isOpen={isAddPlacePopupOpen}
          onAddPlace={handleAddPlaceSubmit}
          onClose={closeAllPopups}
        />
        <PopupWithForm title="Вы уверены?" name="remove-card" buttonText="Да" />
        <EditAvatarPopup
          isOpen={isEditAvatarPopupOpen}
          onUpdateAvatar={handleUpdateAvatar}
          onClose={closeAllPopups}
        />
        <ImagePopup card={selectedCard} onClose={closeAllPopups} />
        <InfoTooltip
          isOpen={isInfoToolTipOpen}
          onClose={closeAllPopups}
          status={tooltipStatus}
        />
      </div>
    </CurrentUserContext.Provider>
  );
}

export default App;
