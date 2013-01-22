class Category < ActiveRecord::Base
  attr_accessible :name
  has_and_belongs_to_many :events
  has_and_belongs_to_many :dreams

  validates :name, :presence => true
end
