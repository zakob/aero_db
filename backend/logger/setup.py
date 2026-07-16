import json
import logging
import logging.config

from config import settings


logger_config = None


def get_logging(module_name: str) -> logging.Logger:
    global logger_config
    # TODO: надо сделать общий конфиг
    if logger_config is None:
        with open("logger/logging_config.json", "r", encoding="utf-8") as f:
            logger_config = json.load(f)

        logger_config["root"]["level"] = settings.LOG_LVL

        logging.config.dictConfig(logger_config)

    logger = logging.getLogger(module_name)

    return logger


logger = get_logging("app")
logger_route = get_logging("route")