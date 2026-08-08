package config

import (
	"context"
	"fmt"
	"os"
	"sync"

	firebase "firebase.google.com/go/v4"
	"firebase.google.com/go/v4/auth"
	"google.golang.org/api/option"
)

var (
	firebaseAuthClient *auth.Client
	firebaseInitOnce   sync.Once
	firebaseInitErr    error
)

// InitFirebase initializes the Firebase Admin SDK using the service account
// key file referenced by FIREBASE_SERVICE_ACCOUNT_KEY_PATH (defaults to
// "firebase-service-account.json" relative to the working directory).
func InitFirebase() error {
	firebaseInitOnce.Do(func() {
		keyPath := os.Getenv("FIREBASE_SERVICE_ACCOUNT_KEY_PATH")
		if keyPath == "" {
			keyPath = "firebase-service-account.json"
		}

		app, err := firebase.NewApp(context.Background(), nil, option.WithCredentialsFile(keyPath))
		if err != nil {
			firebaseInitErr = fmt.Errorf("failed to initialize firebase app: %w", err)
			return
		}

		client, err := app.Auth(context.Background())
		if err != nil {
			firebaseInitErr = fmt.Errorf("failed to initialize firebase auth client: %w", err)
			return
		}

		firebaseAuthClient = client
	})
	return firebaseInitErr
}

// FirebaseAuthClient returns the initialized Firebase Auth client, lazily
// initializing it on first use if InitFirebase has not been called yet.
func FirebaseAuthClient() (*auth.Client, error) {
	if firebaseAuthClient == nil {
		if err := InitFirebase(); err != nil {
			return nil, err
		}
	}
	return firebaseAuthClient, nil
}
