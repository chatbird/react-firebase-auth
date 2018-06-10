import * as React from "react";
import { shallow, mount, render } from "enzyme";
import { spy } from "sinon";
import { FirebaseAuthProvider, FirebaseAuthProviderProps, FirebaseAuthProviderState, FirebaseConfigType } from "../index";
import { Component } from "react";
import firebase from 'firebase';

import post from "../helpers/post";
jest.mock("../helpers/post");

import getProvider from '../helpers/get_provider';
import { truncate } from "fs";
jest.mock("../helpers/get_provider");

const demoConfig : FirebaseConfigType = {
  apiKey: "",
  authDomain: "",
  databaseURL: "",
  messagingSenderId: "",
  projectId: "",
  storageBucket: ""
}

describe("<FirebaseAuthProvider />", () => {
  it("renders the children", () => {
    const wrapper = shallow(<FirebaseAuthProvider firebaseConfig={demoConfig}><h1>Hello!</h1></FirebaseAuthProvider>);
    expect(wrapper.contains(<h1>Hello!</h1>)).toBeTruthy();
  });

  describe("login", () => {
    const onLogin = jest.fn();
    const idToken = "some_id_token";
    const wrapper = shallow(<FirebaseAuthProvider onLogin={onLogin} firebaseConfig={demoConfig}/>);
    const instance = wrapper.instance() as FirebaseAuthProvider;

    it("it calls the onLogin method with the idToken", async () => {
      await instance.login(idToken);
      expect(onLogin).toHaveBeenCalledWith(idToken)
    });
  });
  
  describe("updateToken", () => {
    const currentUser = firebase.auth().currentUser;
    const idToken = "some_id_token";
    const newIdToken = "some_new_id_token";
    const wrapper = shallow(<FirebaseAuthProvider firebaseConfig={demoConfig}/>);
    const instance = wrapper.instance() as FirebaseAuthProvider;

    describe("when not force refreshing", () => {

      beforeAll(() => {
        currentUser.getIdToken = jest.fn().mockReturnValue(new Promise((resolve) => resolve(idToken)));
      })
      
      it("it calls getIdToken on the user with false", () => {
        instance.updateToken(currentUser);
        expect(currentUser.getIdToken).toBeCalledWith(false);
      });

      it("it sets the state with the newIdToken", async () => {
        await instance.updateToken(currentUser, true);
        expect(wrapper.state().firebaseToken).toEqual(idToken);
      });
    });

    describe("when force refreshing", () => {

      beforeAll(() => {
        currentUser.getIdToken = jest.fn().mockReturnValue(new Promise((resolve) => resolve(newIdToken)));
      })

      it("it calls getIdToken on the user with true", () => {
        instance.updateToken(currentUser, true);
        expect(currentUser.getIdToken).toBeCalledWith(true)
      });

      it("it sets the state with the newIdToken", async () => {
        await instance.updateToken(currentUser, true);
        expect(wrapper.state().firebaseToken).toEqual(newIdToken);
      });
    });
  });

  // describe('reauthenticateWithPopup', () => {
  //   const provider = new firebase.auth.GithubAuthProvider();
  //   const providerId = "github.com";
  //   const currentUser = firebase.auth().currentUser;
  //   const wrapper = shallow(<FirebaseAuthProvider firebaseConfig={demoConfig}/>);
  //   const instance = wrapper.instance() as FirebaseAuthProvider;

  //   beforeAll(() => {
  //     (getProvider as any).mockReturnValue(provider);
  //   });

  //   it('calls reauthenticateWithPopup on the currentUser', () => {
  //     instance.reauthenticateWithPopup(providerId);
  //     expect(currentUser.reauthenticateWithPopup).toHaveBeenCalledWith(provider);
  //   });
  // });

  describe('onAuthStateChanged', () => {
    const idToken = "some_token";
    const currentUser = firebase.auth().currentUser;
    const wrapper = shallow(<FirebaseAuthProvider allowAnonymousSignup={true} firebaseConfig={demoConfig}/>);
    const instance = wrapper.instance() as FirebaseAuthProvider;

    describe("when user is anonymous", () => {
      const user = {isAnonymous: true};

      beforeAll(() => {
        instance.updateToken = jest.fn();
      });
  
      it('calls updateToken with user', () => {
        instance.onAuthStateChanged(user);
        expect(instance.updateToken).toHaveBeenCalledWith(user);
      });
    });

    describe("when user is not anonymous", () => {
      const user = {isAnonymous: false, getIdToken: jest.fn().mockResolvedValue(idToken)};

      beforeAll(() => {
        instance.login = jest.fn().mockResolvedValue(true);
        instance.updateToken = jest.fn().mockResolvedValue(true);
      });

      it('calls updateToken with user', async () => {
        await instance.onAuthStateChanged(user);
        expect(instance.updateToken).toHaveBeenCalledWith(user);
      });
    });

    // describe("when user is null", () => {
    //   const user = null;

    //   it('signs in the user anonymously', async () => {
    //     await instance.onAuthStateChanged(user);
    //     expect(firebase.auth().signInAnonymously).toHaveBeenCalled();
    //   });
    // });
  });

  describe("linkWithLinkedIn", () => {
    const idToken = "some_token";
    const pendingCredential = {some: "pendingCredential"};
    const linkedInLinkPath = "linked_in_link_path"
    const wrapper = shallow(<FirebaseAuthProvider linkedInLinkPath={linkedInLinkPath} firebaseConfig={demoConfig} />);
    const instance = wrapper.instance() as FirebaseAuthProvider;
    const currentUser = firebase.auth().currentUser;

    beforeAll(() => {
      instance.updateToken = jest.fn().mockResolvedValue(true);
    });

    it('calls post on the linkedinLinkPath with pending credentials and the idToken', () => {
      instance.linkWithLinkedIn(pendingCredential, idToken);
      expect(post).toHaveBeenCalledWith(linkedInLinkPath, {pendingCredential, idToken})
    });

    // it('calls updateToken with user', async () => {
    //   instance.linkWithLinkedIn(pendingCredential, idToken);
    //   expect(instance.updateToken).toHaveBeenCalledWith(currentUser, true);
    // });

  });
});