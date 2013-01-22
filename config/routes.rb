StalkerBackend::Application.routes.draw do

  match '/dreams/tag', :controller => 'dreams', :action => 'tag'

  resources :categories, :users, :dreams, :events

  root :to => 'categories#new'

  match "signup", :to => "users#new"
  match "login", :to => "sessions#login"
  match "logout", :to => "sessions#logout"
  match "login_attempt", :to => "sessions#login_attempt"

  
end
