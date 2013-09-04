class Event < ActiveRecord::Base
  attr_accessible :name, :display_only_accepted, :is_active, :image, :description
  validates :name, :presence => true
  validates :image, :presence => true
  validates :description, :presence => true
  has_attached_file :image, :path => ":rails_root/public/events/:basename.:extension"
end
