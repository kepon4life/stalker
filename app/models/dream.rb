class Dream < ActiveRecord::Base
  attr_accessible :file_name, :is_valid, :category_ids, :secret_room
  has_and_belongs_to_many :categories

  validates :file_name, :presence => true
  validates :file_name, :presence => true, :uniqueness => true, :format => DREAM_EXTENSION_REGEX
end
