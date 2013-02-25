StalkerBackend::Application.routes.draw do

  match '/dreams/tag', :controller => 'dreams', :action => 'tag'
  match '/dreams/tagDream', :controller => 'dreams', :action => 'tagDream'

  match '/frontend/index', :controller =>"frontend", :action => "index"
  match '/frontend/save', :controller =>"frontend", :action => "save"

  match '/slider', :controller =>"frontend", :action => "slider"

  resources :categories, :users, :dreams, :events

  root :to => 'frontend#index'

  match "pusher", :to => "pusher#test"
  match '/pusher/auth', :controller => 'pusher', :action => 'auth'

  match '/services/nbdreams', :controller => 'services', :action => 'get_number_of_dreams_to_treat'
  match '/services/dreamsevent', :controller => 'services', :action => 'get_dreams_for_event'
  match '/services/categories', :controller => 'services', :action => 'get_categories'
  match '/services/dreamssecretroom' , :controller => 'services', :action => 'get_dreams_for_secret_room'


  match "signup", :to => "users#new"
  match "login", :to => "sessions#login"
  match "logout", :to => "sessions#logout"
  match "login_attempt", :to => "sessions#login_attempt"

  
end
