-- Sallcll ERD snapshot for ERDCloud import (docs/ERD.md 기준)
-- erdcloud.com > New Project > Import > SQL DDL 에 이 파일 내용을 붙여넣으면 자동으로 다이어그램이 그려집니다.

CREATE TABLE `user` (
  id VARCHAR(36) PRIMARY KEY,
  student_no VARCHAR(20) NOT NULL,
  department VARCHAR(100) NOT NULL,
  enroll_year INT NOT NULL
);

CREATE TABLE course (
  id VARCHAR(36) PRIMARY KEY,
  course_code VARCHAR(20) NOT NULL,
  name VARCHAR(100) NOT NULL,
  credit INT NOT NULL,
  category VARCHAR(50) NOT NULL
);

CREATE TABLE course_section (
  id VARCHAR(36) PRIMARY KEY,
  course_id VARCHAR(36) NOT NULL,
  section_no VARCHAR(10) NOT NULL,
  professor VARCHAR(50) NOT NULL,
  capacity INT NOT NULL,
  FOREIGN KEY (course_id) REFERENCES course(id)
);

CREATE TABLE time_slot (
  id VARCHAR(36) PRIMARY KEY,
  section_id VARCHAR(36) NOT NULL,
  day VARCHAR(10) NOT NULL,
  period INT NOT NULL,
  room VARCHAR(50) NOT NULL,
  FOREIGN KEY (section_id) REFERENCES course_section(id)
);

CREATE TABLE user_timetable (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  semester VARCHAR(20) NOT NULL,
  name VARCHAR(50) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES `user`(id)
);

CREATE TABLE timetable_entry (
  id VARCHAR(36) PRIMARY KEY,
  timetable_id VARCHAR(36) NOT NULL,
  section_id VARCHAR(36) NOT NULL,
  FOREIGN KEY (timetable_id) REFERENCES user_timetable(id),
  FOREIGN KEY (section_id) REFERENCES course_section(id)
);

CREATE TABLE wishlist_item (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  section_id VARCHAR(36) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES `user`(id),
  FOREIGN KEY (section_id) REFERENCES course_section(id)
);

CREATE TABLE user_completion (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  course_code VARCHAR(20) NOT NULL,
  semester VARCHAR(20) NOT NULL,
  grade VARCHAR(5) NOT NULL,
  status VARCHAR(20) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES `user`(id)
);

CREATE TABLE graduation_requirement_set (
  id VARCHAR(36) PRIMARY KEY,
  department VARCHAR(100) NOT NULL,
  year_range VARCHAR(20) NOT NULL,
  total_credit INT NOT NULL
);

CREATE TABLE required_course_group (
  id VARCHAR(36) PRIMARY KEY,
  requirement_set_id VARCHAR(36) NOT NULL,
  group_name VARCHAR(50) NOT NULL,
  FOREIGN KEY (requirement_set_id) REFERENCES graduation_requirement_set(id)
);

CREATE TABLE required_course_group_item (
  id VARCHAR(36) PRIMARY KEY,
  group_id VARCHAR(36) NOT NULL,
  course_code VARCHAR(20) NOT NULL,
  FOREIGN KEY (group_id) REFERENCES required_course_group(id)
);

CREATE TABLE balanced_ge_area (
  id VARCHAR(36) PRIMARY KEY,
  requirement_set_id VARCHAR(36) NOT NULL,
  area_name VARCHAR(50) NOT NULL,
  min_courses INT NOT NULL,
  FOREIGN KEY (requirement_set_id) REFERENCES graduation_requirement_set(id)
);

CREATE TABLE graduation_check_result (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  requirement_set_id VARCHAR(36) NOT NULL,
  total_credit INT NOT NULL,
  verdict VARCHAR(20) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES `user`(id),
  FOREIGN KEY (requirement_set_id) REFERENCES graduation_requirement_set(id)
);

CREATE TABLE practice_session (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  semester VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL,
  FOREIGN KEY (user_id) REFERENCES `user`(id)
);

CREATE TABLE practice_seat_pool (
  id VARCHAR(36) PRIMARY KEY,
  session_id VARCHAR(36) NOT NULL,
  section_id VARCHAR(36) NOT NULL,
  remaining_seats INT NOT NULL,
  FOREIGN KEY (session_id) REFERENCES practice_session(id),
  FOREIGN KEY (section_id) REFERENCES course_section(id)
);

CREATE TABLE practice_attempt (
  id VARCHAR(36) PRIMARY KEY,
  session_id VARCHAR(36) NOT NULL,
  section_id VARCHAR(36) NOT NULL,
  result VARCHAR(20) NOT NULL,
  FOREIGN KEY (session_id) REFERENCES practice_session(id),
  FOREIGN KEY (section_id) REFERENCES course_section(id)
);
