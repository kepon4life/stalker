datetime_formats = {
  :standard => "%d/%m/%Y - %H:%M:%S"
}
Date::DATE_FORMATS.merge!(
  datetime_formats.merge(
    :dmy => "%d%m%Y"
  )
)
Time::DATE_FORMATS.merge!(
  datetime_formats
)