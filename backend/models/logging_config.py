import sys
import logging

logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s %(levelname)s: %(message)s',
    stream=sys.stdout  # directs logs to stdout
)

logger = logging.getLogger(__name__)