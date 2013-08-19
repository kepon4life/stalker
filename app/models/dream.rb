class Dream < ActiveRecord::Base
  attr_accessible :metadatas, :is_valid, :secret_room, :category_ids, :created_at
  has_and_belongs_to_many :categories

  validates :metadatas, :presence => true
end
