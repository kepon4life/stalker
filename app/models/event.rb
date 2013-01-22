class Event < ActiveRecord::Base
  attr_accessible :name, :category_ids
  has_and_belongs_to_many :categories

  validates :name, :presence => true
end
