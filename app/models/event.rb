class Event < ActiveRecord::Base
  attr_accessible :name, :display_only_accepted, :is_active, :image
  has_many :events, dependent: :destroy
  validates :name, :presence => true
  has_attached_file :image, :path => ":rails_root/public/events/:basename.:extension"
end
