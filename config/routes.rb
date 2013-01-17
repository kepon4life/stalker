StalkerBackend::Application.routes.draw do

  resources :categories, :users

  root :to => 'categories#new'

  match "signup", :to => "users#new"
  match "login", :to => "sessions#login"
  match "logout", :to => "sessions#logout"
  match "login_attempt", :to => "sessions#login_attempt"

  
end
