StalkerBackend::Application.routes.draw do

  match '/dreams/tag', :controller => 'dreams', :action => 'tag'
  match '/dreams/tagDream', :controller => 'dreams', :action => 'tagDream'

  match '/dreams/tagwithcat', :controller => 'dreams', :action => 'tagWithCat'
  match '/dreams/tagDreamwithcat', :controller => 'dreams', :action => 'tagDreamWithCat'

  match '/frontend/index', :controller =>"frontend", :action => "index"
  match '/frontend/save', :controller =>"frontend", :action => "save"

  match '/slider', :controller =>"frontend", :action => "slider"
  match '/draw', :controller => "frontend", :action => "draw"
  match '/drawsmartphone', :controller => "frontend", :action => "drawsmartphone"

  resources :categories, :users, :dreams, :events

  root :to => 'frontend#draw'

  match "pusher", :to => "pusher#test"
  match '/pusher/auth', :controller => 'pusher', :action => 'auth'

  match '/services/nbdreams', :controller => 'services', :action => 'get_number_of_dreams_to_treat'
  match '/services/dreamsevent', :controller => 'services', :action => 'get_dreams_for_event'
  match '/services/categories', :controller => 'services', :action => 'get_categories'
  match '/services/dreamssecretroom' , :controller => 'services', :action => 'get_dreams_for_secret_room'
  
end
